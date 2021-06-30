#!/usr/bin/env node

/**
 * @file
 * Runs a series of reports against the IBM Cloud Jira project.
 */

// Load dependencies.
require('./src/prototype');
const program = require('commander');
const IbmReports = require('./src/IbmReporter');

// Parse arguments into program.
program
    .option('-r, --report <string>', 'The name of the report to run.')
    .option('-f, --format <string>', "The format to render the data.  Defaults to human-readable.")
    .option('-l, --list', "List the available reports.")
    .option('-d, --debug', "Print more verbose errors.")
    .parse(process.argv);
const options = program.opts();

// Run a list of available reports, if requested.
if (options.list) {
    IbmReports.printReportList();
    process.exit(0);
}

// Run a specific report.
if (options.report) {
    // If we're running a single report from the CL, don't chain the prompt.
    options.chain = false;
    IbmReports.runReport(options.report, options).catch(err => {
        IbmReports.logError(err);
    });
} else {
    IbmReports.run(options).catch(err => {
        IbmReports.logError(err);
    });
}