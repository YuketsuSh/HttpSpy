const http = require('http');
const https = require('https');
const net = require('net');
const dns = require('dns');
const fs = require('fs');
const { logRequest, saveLogs } = require('./logger');

let proxyServer = null;
let isMonitoringActive = false;
const activeSockets = new Set();

/**
 * Resolves the public IP of a hostname.
 *
 * @param {string} hostname - The hostname to resolve.
 * @returns {Promise<string>} - The resolved public IP address.
 */
const resolvePublicIP = (hostname) => {
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, { family: 4 }, (err, address) => {
      if (err) {
        reject(err);
      } else {
        resolve(address);
      }
    });
  });
};

/**
 * Tracks data sent and received via sockets.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Function} callback - The function to call with data metrics.
 */
const trackDataSizes = (req, res, callback) => {
  let dataSentSize = 0;
  let dataReceivedSize = 0;

  req.on('data', (chunk) => {
    dataSentSize += chunk.length;
  });

  res.on('data', (chunk) => {
    dataReceivedSize += chunk.length;
  });

  res.on('finish', () => {
    callback({
      dataSentSize: `${dataSentSize} bytes`,
      dataReceivedSize: `${dataReceivedSize} bytes`
    });
  });

  res.on('error', (err) => {
    console.error('Error with response data tracking:', err);
  });

  req.on('error', (err) => {
    console.error('Error with request data tracking:', err);
  });
};

/**
 * Handles incoming HTTP requests.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} res - The HTTP response object.
 * @param {Array} filteredMethods - The filtered methods (GET, POST, etc.).
 * @param {boolean} realtime - Flag for logging in real-time.
 * @param {boolean} debug - Flag for capturing additional debug information.
 */
const handleHttpRequest = async (req, res, filteredMethods, realtime, debug) => {
  const startTime = process.hrtime();
  let dataSentSize = 0;
  let dataReceivedSize = 0;

  const requestData = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body || '',
    sourceIP: req.socket.remoteAddress,
    sourcePort: req.socket.remotePort,
    destinationIP: req.socket.localAddress,
    destinationPort: req.socket.localPort,
  };

  const isMethodAllowed = filteredMethods.length === 0 || filteredMethods.includes(req.method.toUpperCase());

  try {
    const { hostname } = new URL(req.url);
    requestData.destinationIP = await resolvePublicIP(hostname);
  } catch (err) {
    console.error('Failed to resolve IP:', err);
  }

  if (!isMethodAllowed) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Request method not allowed.');
    return;
  }

  trackDataSizes(req, res, (dataMetrics) => {
    const elapsedTime = process.hrtime(startTime);
    const responseTime = `${(elapsedTime[0] * 1000 + elapsedTime[1] / 1e6).toFixed(2)}ms`;

    logRequest({
      ...requestData,
      responseTime,
      ...dataMetrics
    }, debug);

    if (realtime) {
      console.log(`[Real-time] ${req.method} ${req.url}`);
    }
  });

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Request logged and forwarded');
};

/**
 * Handles incoming HTTPS requests.
 * Only enabled if the --https flag is provided.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} socket - The socket for the connection.
 * @param {Buffer} head - The first packet of the connection.
 * @param {Array} filteredMethods - The filtered methods (GET, POST, etc.).
 * @param {boolean} realtime - Flag for logging in real-time.
 * @param {boolean} debug - Flag for capturing additional debug information.
 */
const handleHttpsRequest = async (req, socket, head, filteredMethods, realtime, debug) => {
  const startTime = process.hrtime();
  let dataSentSize = 0;
  let dataReceivedSize = 0;

  const { port, hostname } = new URL(`https://${req.url}`);
  console.log(`Intercepting HTTPS request to: ${hostname}`);

  const proxySocket = net.connect(port || 443, hostname, async () => {
    socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    proxySocket.write(head);
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);

    const requestData = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      sourceIP: req.socket.remoteAddress,
      sourcePort: req.socket.remotePort,
      destinationIP: await resolvePublicIP(hostname),
      destinationPort: proxySocket.remotePort
    };

    proxySocket.on('data', (chunk) => {
      dataReceivedSize += chunk.length;
    });

    socket.on('data', (chunk) => {
      dataSentSize += chunk.length;
    });

    logRequest(requestData, debug);

    proxySocket.on('end', () => {
      const elapsedTime = process.hrtime(startTime);
      requestData.responseTime = `${(elapsedTime[0] * 1000 + elapsedTime[1] / 1e6).toFixed(2)}ms`;
      requestData.dataSentSize = `${dataSentSize} bytes`;
      requestData.dataReceivedSize = `${dataReceivedSize} bytes`;

      logRequest(requestData, debug);

      if (realtime) {
        console.log(`[Real-time HTTPS] ${req.method} ${req.url}`);
      }
    });
  });

  proxySocket.on('error', (err) => {
    console.error('Error handling HTTPS request:', err);
    socket.end();
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
    proxySocket.end();
  });
};

const destroyActiveSockets = () => {
  activeSockets.forEach((socket) => {
    socket.destroy();
  });
};

const startMonitoring = (port = 8089, { methods = [], realtime = false, saveFilePath = 'logs/logs.txt', debug = false, useHttps = false } = {}) => {
  if (isMonitoringActive) {
    console.log('Monitoring is already active');
    return;
  }

  const filteredMethods = methods.map(method => method.toUpperCase());

  proxyServer = http.createServer((req, res) => {
    handleHttpRequest(req, res, filteredMethods, realtime, debug);
  });

  if (useHttps) {
    proxyServer.on('connect', (req, socket, head) => {
      handleHttpsRequest(req, socket, head, filteredMethods, realtime, debug);
    });
  }

  proxyServer.on('connection', (socket) => {
    activeSockets.add(socket);
    socket.on('close', () => activeSockets.delete(socket));
  });

  proxyServer.listen(port, () => {
    console.log(`HTTP${useHttps ? '/HTTPS' : ''} Transparent Proxy monitoring started on port ${port}`);
    isMonitoringActive = true;
    fs.writeFileSync('./proxy-server.pid', process.pid.toString());
  });

  process.on('SIGINT', async () => {
    console.log('\nGracefully shutting down...');

    try {
      await saveLogs(saveFilePath);
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
