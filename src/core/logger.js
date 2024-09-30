const fs = require('fs');
const path = require('path');
let logs = [];

/**
 * Logs the HTTP/HTTPS request data.
 *
 * @param {Object} data - The request data to log.
 * @param {boolean} debug - Flag to capture additional debug information.
 */
const logRequest = (data, debug = false) => {
  const logEntry = {
    method: data.method,
    url: data.url,
    headers: data.headers,
    body: data.body || 'No body',
    timestamp: new Date().toISOString(),
  };

  if (debug) {
    logEntry.sourceIP = data.sourceIP || 'N/A';
    logEntry.sourcePort = data.sourcePort || 'N/A';
    logEntry.destinationIP = data.destinationIP || 'N/A';
    logEntry.destinationPort = data.destinationPort || 'N/A';
    logEntry.responseTime = data.responseTime || 'N/A';
    logEntry.dataSentSize = data.dataSentSize || 'N/A';
    logEntry.dataReceivedSize = data.dataReceivedSize || 'N/A';
  }

  logs.push(logEntry);

  console.log(`Logged request: ${logEntry.method} | ${logEntry.url}`);
};

/**
 * Saves logs to a file in the appropriate format (JSON, CSV, or TXT).
 *
 * @param {string} [filePath='logs/logs.txt'] - The file path where logs should be saved.
 */
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
    console.error('Unsupported log format. Use .json, .csv, or .txt.');
    return;
  }

  try {
    await fs.promises.writeFile(filePath, formattedLogs);
    console.log(`Logs successfully saved to: ${filePath}`);
  } catch (err) {
    console.error(`Failed to save logs: ${err.message}`);
    throw err;
  }
};

process.on('exit', () => {
  console.log('Application exiting, saving logs...');
});

module.exports = { logRequest, saveLogs };
