/**
 * Main functionality for the program.
 */

const inquirer = require('inquirer');
const reports = require('./reports');
const jiraTools = require('./jira-tools');
const config = require('../config');

const IbmReporter = {
    /**
     * Run the program.
     *
     * @param options
     * @returns {Promise<unknown>}
     */
    run: (options) => {
        return new Promise((resolve, reject) => {
            const reportList = IbmReporter.getReportList();

            // Add an "exit" option.
            reportList.push({name: "Exit", value: "exit"});

            // Create questions for prompt.
            const questions = [
                {
                    type: 'list',
                    name: 'report',
                    message: "What report do you want to run?",
                    choices: reportList
                }
            ];

            console.log("");
            inquirer.prompt(questions).then(answers => {
                // Kick out if we're done.
                if (answers.report === 'exit') {
                    process.exit(0);
                }

                // Run the report.
                resolve(IbmReporter.runReport(answers.report, options));
            }).catch(err => {
                reject(err);
            });
        });
    },

    /**
     * Run a single report.
     *
     * @param reportName
     * @param options
     * @returns {Promise<unknown>}
     */
    runReport: (reportName, options) => {
        return new Promise((resolve, reject) => {
            if (reports.hasOwnProperty(reportName)) {
                jiraTools.connect(config).then(jiraApi => {
                    reports[reportName].process(jiraApi, options).then(res => {
                        if (reports[reportName]?.chain && options?.chain !== false) {
                            resolve(IbmReporter.run(options));
                        } else {
                            resolve(res);
                        }
                    }).catch(err => {
                        reject(err);
                    });
                });
            } else {
                reject(new Error("Invalid report name."));
            }
        });
    },

    /**
     * Get list of reports for the prompt.
     *
     * @returns {*[]}
     */
    getReportList: () => {
        const reportList = [];
        for (let i in reports) {
            reportList.push({name: reports[i].label, value: i});
        }

        return reportList;
    },

    /**
     * Print a list of available reports to the console.
     */
    printReportList: () => {
        const reportList = IbmReporter.getReportList();

        console.log("Available Reports:");
        for (let i in reportList) {
            console.log(`  ${reportList[i].name} (${reportList[i].value})`);
        }

        process.exit(0);
    },

    /**
     * Log an error to the console.
     *
     * @param err
     * @param debug
     */
    logError: (err, debug) => {
        debug = debug || false;

        if (debug) {
            console.error(err);
        } else {
            console.error('😵️ ' + err.message);
        }
    }
};

module.exports = IbmReporter;