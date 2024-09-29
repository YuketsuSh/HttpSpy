const fs = require('fs');
const path = require('path');
const logs = [];

const logRequest = (data) => {

  const logEntry = {
    method: data.method,
    url: data.url,
    headers: data.headers,
    body: data.body || 'No body',
    timestamp: new Date().toISOString(),
  };

  logs.push(logEntry);

  console.log(`Loggged request: ${logEntry.method} | ${logEntry.url}`);

};

const saveLogs = async (filename = 'logs.txt') => {
  const logsDir = path.join(__dirname, '../../logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
  }

  const filePath = path.join(logsDir, filename);

  try {
    await fs.promises.writeFile(filePath, JSON.stringify(logs, null, 2));
    console.log(`Logs successfully saved to : ${filePath}`);
  }catch (err){
    console.error(`Failed to save logs: ${err.message}`);
    throw err;
  }

};

module.exports = { logRequest, saveLogs };