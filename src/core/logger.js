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

const saveLogs = async (filePath = 'logs/logs.txt') => {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const ext = path.extname(filePath).toLowerCase();
  let formattedLogs = '';

  if (logs.length === 0) {
    console.log('No logs to save.');
    return;
  }

  if (ext === '.json') {
    formattedLogs = JSON.stringify(logs, null, 2);
  } else if (ext === '.csv') {
    const csvHeaders = Object.keys(logs[0]).join(',');
    const csvRows = logs.map(log => Object.values(log).join(',')).join('\n');
    formattedLogs = `${csvHeaders}\n${csvRows}`;
  } else if (ext === '.txt') {
    formattedLogs = logs.map(log => `${log.method} | ${log.url} [${log.timestamp}]`).join('\n');
  } else {
    formattedLogs = JSON.stringify(logs, null, 2);
  }

  try {
    await fs.promises.writeFile(filePath, formattedLogs);
    console.log(`Logs successfully saved to: ${filePath}`);
  } catch (err) {
    console.error(`Failed to save logs: ${err.message}`);
    throw err;
  }
};

module.exports = { logRequest, saveLogs };