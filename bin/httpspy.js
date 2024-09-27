#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');

const program = new Command();

program.name('httpspy').description('CLI tool for HTTP monitoring')
.version('1.0.0');

program.command('start')
.description('Start the HTTP monitoring server')
.action(() => {
    console.log(chalk.green('Starting HTTP monitoring'));
})

program
    .command('stop')
    .description('Stop monitoring and save logs')
    .action(() => {
        console.log(chalk.yellow('Stopping HTTP monitoring...'));
    });

program.parse(process.argv);