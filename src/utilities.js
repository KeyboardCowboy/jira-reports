/**
 * Collection of general utility methods.
 */
require('./prototype');
const inquirer = require('inquirer');

module.exports = {
    /**
     * Get the  name of the report to run.  If not supplied, give users a choice.
     *
     * @param options
     * @param reports
     * @returns {Promise<unknown>}
     */
    getReport: (options, reports) => {
        return new Promise((resolve, reject) => {
            // Get a list of report names from the processor.
            let reportNames = [];
            for (let i in reports) {
                reportNames.push({name: reports[i].label, value: i});
            }

            // If a report wasn't specified as an option, ask the user for it.
            if (!options.report) {
                const reportQuestion = {
                    type: 'list',
                    name: 'reportName',
                    message: "What report would you like to run?",
                    choices: reportNames
                }

                inquirer.prompt([reportQuestion]).then(answer => {
                    resolve(answer.reportName);
                });
            } else {
                resolve(options.report);
            }
        });
    },

    getReports: () => {

    }
}