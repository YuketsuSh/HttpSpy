const http = require('http');
const https = require('https');

let proxyServer = null;

const startMonitoring =  () => {
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
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Request logged and forwarded');
    });

    req.on('error', (err) => {
      console.error('Error handling request:', err);
      res.writeHead(500);
      res.end('Internal Server Error');
    });

  });

  proxyServer.listen(process.env.PORT, () => {
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