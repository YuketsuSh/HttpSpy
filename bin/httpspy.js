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
    .description('CLI tool for HTTP monitoring')
    .version('1.0.0', '-v, --version', 'output the version number')
    .addHelpText('after', `\nAuthor: Yuketsu`);

program.command('start')
.description('Start the HTTP monitoring server')
.action(() => {
    console.log(chalk.green(`Starting HTTP monitoring on port ${process.env.PORT || 8089}...`));
    startMonitoring(process.env.PORT);
})

program.command('stop')
    .description('Stop monitoring and save logs')
    .action(() => {
        try {
            saveLogs();

            const pid = fs.readFileSync('./proxy-server.pid', 'utf8');
            process.kill(pid);

            fs.unlinkSync('./proxy-server.pid');
        }catch (err){
            console.log('No monitoring active to stop.');
        }
    });

program.parse(process.argv);