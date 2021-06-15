#!/usr/bin/env node

/**
 * @file
 * Runs a series of reports against the IBM Cloud Jira project.
 */

// Load dependencies.
require('./src/prototype');
const program = require('commander');
const utils = require('./src/utilities');
const reports = require('./src/reports');
const jiraTools = require('./src/jira-tools');
const config = require('./config');

// Parse arguments into program.
program
    .option('-r, --report <string>', 'The name of the report to run.')
    .option('-f, --format <string>', "The format to render the data.  Defaults to human-readable.")
    .option('-l, --list', "List the available reports.")
    .parse(process.argv);
const options = program.opts();

// Run a list of available reports, if requested.
if (options.list) {
    console.log("Available Reports:");

    for (let i in reports) {
        console.log(`  ${reports[i].label} (${i})`);
    }

    process.exit(0);
}

// Run a report.
jiraTools.connect(config).then(jiraApi => {
    utils.getReport(options, reports).then(reportName => {
        // Make sure we have a valid report name.
        if (!reports.hasOwnProperty(reportName)) {
            throw new Error('Invalid report selected.');
        }

        // Make sure the report has defined a processor.
        if (!reports[reportName].hasOwnProperty('process')) {
            throw new Error(`No processor was defined for the ${reports[reportName].label} report.`);
        }

        // Run the report.
        reports[reportName].process(jiraApi, options);
    }).catch(err => {
        console.error('❌️ ' + err.message);
    });
}).catch(err => {
    console.error('❌️ ' + err.message);
});
