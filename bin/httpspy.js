#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const {startMonitoring, stopMonitoring} = require("../src/core/monitor");
const {saveLogs} = require("../src/core/logger");
require('dotenv').config();

const program = new Command();

program.name('httpspy').description('CLI tool for HTTP monitoring')
.version('1.0.0');

program.command('start')
.description('Start the HTTP monitoring server')
.action(() => {
    console.log(chalk.green(`Starting HTTP monitoring on port ${process.env.PORT || 8089}...`));
    startMonitoring(process.env.PORT);
})

program
    .command('stop')
    .description('Stop monitoring and save logs')
    .action(() => {
        console.log(chalk.yellow('Stopping HTTP monitoring...'));
        stopMonitoring();
        saveLogs()
    });

program.parse(process.argv);