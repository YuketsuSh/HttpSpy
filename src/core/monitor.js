const http = require('http');
const https = require('https');
const net = require('net');
const path = require('path');
const forge = require('node-forge');
const fs = require('fs');
const { logRequest, saveLogs } = require('./logger');

let proxyServer = null;
let isMonitoringActive = false;
const activeSockets = new Set();

const certsDir = path.join(__dirname, '../../certs');
const rootCertPath = path.join(certsDir, 'root-cert.pem');
const rootKeyPath = path.join(certsDir, 'root-key.pem');

const generateSSLCertificates = (hostname) => {
  if (!fs.existsSync(rootCertPath) || !fs.existsSync(rootKeyPath)) {
    console.log('Root SSL Certificates not found, Generating new certificates...');
    const pki = forge.pki;
    const keys = pki.rsa.generateKeyPair(2048);
    const cert = pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);

    const attrs = [
      { name: 'commonName', value: hostname || 'localhost' },
      { name: 'countryName', value: 'US' },
      { shortName: 'ST', value: 'California' },
      { name: 'localityName', value: 'San Francisco' },
      { name: 'organizationName', value: 'My Company' },
      { shortName: 'OU', value: 'My Division' }
    ];

    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.setExtensions([
      { name: 'basicConstraints', cA: true },
      { name: 'keyUsage', keyCertSign: true, digitalSignature: true, keyEncipherment: true },
      { name: 'extKeyUsage', serverAuth: true },
      { name: 'nsCertType', sslServer: true },
      { name: 'subjectAltName', altNames: [{ type: 2, value: hostname }] }
    ]);

    cert.sign(keys.privateKey);

    const privateKeyPem = pki.privateKeyToPem(keys.privateKey);
    const certPem = pki.certificateToPem(cert);

    fs.writeFileSync(rootKeyPath, privateKeyPem);
    fs.writeFileSync(rootCertPath, certPem);
    console.log('Root SSL Certificates generated successfully');
  }
};

const handleHttpRequest = (req, res, filteredMethods, realtime) => {
  const requestData = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body || ''
  };

  const isMethodAllowed = filteredMethods.length === 0 || filteredMethods.includes(req.method.toUpperCase());

  if (!isMethodAllowed) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Request method not allowed.');
    return;
  }

  req.on('data', (chunk) => {
    requestData.body += chunk;
  });

  req.on('end', () => {
    logRequest(requestData);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Request logged and forwarded');

    if (realtime) {
      console.log(`[Real-time] ${req.method} ${req.url}`);
    }
  });

  req.on('error', (err) => {
    console.error('Error handling request:', err);
    res.writeHead(500);
    res.end('Internal Server Error');
  });
};

const handleHttpsRequest = (req, socket, head, filteredMethods, realtime) => {
  const { port, hostname } = new URL(`https://${req.url}`);
  console.log(`Intercepting HTTPS request to: ${hostname}`);

  const proxySocket = net.connect(port || 443, hostname, () => {
    socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    proxySocket.write(head);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);

    const requestData = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body || ''
    };
    logRequest(requestData);

    if (realtime) {
      console.log(`[Real-time HTTPS] ${req.method} ${req.url}`);
    }
  });

  proxySocket.on('error', (err) => {
    console.error('Error handling HTTPS request:', err);
    socket.end();
  });
};


const destroyActiveSockets = () => {
  activeSockets.forEach((socket) => {
    socket.destroy();
  });
};


const startMonitoring = (port = 8089, { methods = [], realtime = false } = {}) => {
  if (isMonitoringActive) {
    console.log('Monitoring is already active');
    return;
  }

  const filteredMethods = methods.map(method => method.toUpperCase());

  proxyServer = http.createServer((req, res) => {
    handleHttpRequest(req, res, filteredMethods, realtime);
  });

  proxyServer.on('connect', (req, socket, head) => {
    handleHttpsRequest(req, socket, head, filteredMethods, realtime);
  });

  proxyServer.on('connection', (socket) => {
    activeSockets.add(socket);
    socket.on('close', () => activeSockets.delete(socket));
  });

  proxyServer.listen(port, () => {
    console.log(`HTTP/HTTPS Transparent Proxy monitoring started on port ${port}`);
    isMonitoringActive = true;
    fs.writeFileSync('./proxy-server.pid', process.pid.toString());
  });

  process.on('SIGINT', async () => {
    console.log('\nGracefully shutting down...');

    try {
      await saveLogs();
    } catch (error) {
      console.error('Failed to save logs during shutdown:', error);
    }

    destroyActiveSockets();

    if (proxyServer && isMonitoringActive) {
      proxyServer.close(() => {
        console.log('Monitoring stopped');
        isMonitoringActive = false;

        if (fs.existsSync('./proxy-server.pid')) {
          fs.unlinkSync('./proxy-server.pid');
        }

        console.log('PID file removed.');
        process.nextTick(() => process.exit(0));
      });
    } else {
      console.log('No active server, exiting immediately...');
      process.nextTick(() => process.exit(0));
    }
  });
};

module.exports = { startMonitoring };
