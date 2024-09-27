const http = require('http');
const https = require('https');
const {logRequest} = require("./logger");

let proxyServer = null;

const startMonitoring =  (port =  8089) => {
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
    console.log(`Listening on port ${process.env.PORT}`);
  });
};

const stopMonitoring =  () => {
  if (proxyServer){
    proxyServer.close(() => {
      console.log('HTTP monitoring stopped');
    });
  }else{
    console.log('No monitoring active to stop.');
  }
};

module.exports = { startMonitoring, stopMonitoring };