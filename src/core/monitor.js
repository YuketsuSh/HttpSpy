const http = require('http');
const fs = require('fs');
const { logRequest, saveLogs } = require('./logger');

let proxyServer = null;
let isMonitoringActive = false;

const startMonitoring = (port = 8089) => {

  if (isMonitoringActive) {
    console.log('Monitoring is already active');
    return;
  }

  proxyServer = http.createServer((req, res) => {
    const requestData = {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: ''
    };

    req.on('data', (chunk) => {
      requestData.body += chunk;
    });

    req.on('end', () => {
      logRequest(requestData);
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Request logged and forwarded');
    });

    req.on('error', (err) => {
      console.error('Error handling request:', err);
      res.writeHead(500);
      res.end('Internal Server Error');
    });
  });

  proxyServer.listen(port, () => {
    console.log(`HTTP monitoring started on port ${port}`);
    isMonitoringActive = true;
    fs.writeFileSync('./proxy-server.pid', process.pid.toString());
  });

  process.on('SIGINT', () => {
    console.log('\nGracefully shutting down...');

    saveLogs();

    if (proxyServer && isMonitoringActive) {
      proxyServer.close(() => {
        console.log('HTTP monitoring stopped');
        isMonitoringActive = false;

        if (fs.existsSync('./proxy-server.pid')) {
          fs.unlinkSync('./proxy-server.pid');
        }

        console.log('PID file removed.');

        process.kill(process.pid, 'SIGKILL');
      });
    } else {
      console.log('No active server, exiting immediately...');
      process.kill(process.pid, 'SIGKILL');
    }
  });
};

module.exports = { startMonitoring };
