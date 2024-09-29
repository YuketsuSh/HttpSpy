#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const fs = require('fs');
const {startMonitoring, stopMonitoring} = require("../src/core/monitor");
const {saveLogs} = require("../src/core/logger");
require('dotenv').config();

const program = new Command();

program
    .name('httpspy')
    .description('CLI tool for HTTP/HTTPS monitoring')
    .version('1.0.0', '-v, --version', 'output the version number')
    .addHelpText('after', `\nAuthor: Yuketsu`);

program.command('start')
    .description('Start the HTTP monitoring server')
    .option('-p, --port <number>', 'Specify the port', process.env.PORT || 8089)
    .option('-m, --methods <methods>', 'Filter by HTTP methods (comma-separated)', '')
    .option('-r, --realtime', 'Log requests in real-time to console', false)
    .option('--https', 'Enable HTTPS monitoring with automatic SSL certificate generation', false)
    .option('--save <filepath>', 'Save logs to the specified filepath or filename', 'logs/logs.txt')
    .action((options) => {
        const port = options.port;
        const methods = options.methods ? options.methods.split(',') : [];
        const realtime = options.realtime;
        const useHttps = options.https;
        const saveFilePath = options.save;

        console.log(chalk.green(`Starting HTTP${useHttps ? '/HTTPS' : ''} monitoring on port ${port}...`));
        startMonitoring(port, { methods, realtime, useHttps, saveFilePath });

    });

program.command('stop')
    .description('Stop monitoring and save logs')
    .option('--save <filepath>', 'Specify custom file to save logs')
    .action(async (options) => {
        try {
            await saveLogs(options.save);
            const pid = fs.readFileSync('./proxy-server.pid', 'utf8');
            process.kill(pid);
            fs.unlinkSync('./proxy-server.pid');
        } catch (err) {
            console.log('No monitoring active to stop.');
        }
    });

program.parse(process.argv);