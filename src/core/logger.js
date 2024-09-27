const fs = require('fs');
const path = require('path');
const logs = [];

const logRequest = (data) => {
  logs.push(data);
  console.log(`Logged request: ${data.method} ${data.url}`);
};

const saveLogs = (filename = 'logs.txt') => {
  const filePath = path.join(__dirname, '../../logs', filename);
  fs.writeFileSync(filePath, JSON.stringify(logs, null, 2));
  console.log(`Log saved to: ${filePath}`);
};

module.exports = { logRequest, saveLogs };