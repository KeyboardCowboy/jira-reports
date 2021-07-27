/**
 * Contains the different reports that can be run.
 */
require('./prototype');
const prompt = require('prompt-sync')({sigint: true});
const utilities = require('./utilities');
const jiraToolbox = require('./jira-tools');

module.exports = {
    /**
     * Get the team's velocity over a given period using ticket resolution as a metric.
     */
    velocity: {
        label: "Velocity Report",
        chain: true,
        process: (jiraApi, options) => {
            return new Promise((resolve, reject) => {
                // Collect the necessary params for this report.
                const days = prompt("Days of history [90]: ") || 90;
                const ravg = parseInt(prompt("Weekly Rolling Average [0]: ")) || 0;

                // Get resolved tickets.
                let search_query = `project = HC AND resolutiondate >= "-${days}d" AND status NOT IN ("Cancelled") AND resolution NOT IN ("Cancelled") ORDER BY resolved desc`;
                let search_options = {
                    'maxResults': 5000,
                    'fields': ['resolutiondate'],
                };

                // Snag the results from Jira.
                jiraApi.searchJira(search_query, search_options).then(response => {
                    if (response.issues.length === 0) {
                        console.log("No issues returned.");
                        process.exit(1);
                    }

                    // Group issues by week resolved.
                    let issuesByWeek = jiraToolbox.groupByWeek(response.issues, 'resolutiondate');

                    // Trim first and last weeks in case they have incomplete data.
                    let weeks = Object.keys(issuesByWeek);
                    weeks.nsort();
                    delete issuesByWeek[weeks.shift()];
                    delete issuesByWeek[weeks.pop()];

                    // Calculate rolling averages.
                    let j = 0;
                    const max = weeks.length;
                    let interval = ravg === 0 ? max : ravg;
                    while ((j + interval) < max + 1) {
                        let tot = 0;
                        for (let i = j; i < (interval + j); i++) {
                            if (options.format === "data-only") {
                                console.log(`${weeks[i]},${issuesByWeek[weeks[i]]}`);
                            } else {
                                console.log("Week " + weeks[i] + " velocity: " + issuesByWeek[weeks[i]]);
                            }
                            tot = tot + parseInt(issuesByWeek[weeks[i]]);
                        }

                        let avg = Math.round(tot / interval);
                        console.log(interval + " week rolling average: " + avg + '\n');
                        j = j + 1;
                    }

                    resolve(true);
                }).catch(err => {
                    reject(err);
                });
            });
        }
    },

    /**
     * Generate a report of created bugs by week.
     *
     * @param jiraApi
     * @param format
     */
    bugs: {
        label: "Bug Report",
        chain: true,
        process: (jiraApi, options) => {
            return new Promise((resolve, reject) => {
                // Collect the necessary params for this report.
                const days = parseInt(prompt("Days of history [90]: ")) || 90;

                // Build a collection object to aggregate data.
                const bucket = {};
                let date = new Date();
                date.setDate(`-${days}`);
                const firstWeek = date.getFullWeek();
                bucket[firstWeek] = 0;
                date = date.setDate(7);
                const secondWeek = date.getFullWeek();
                bucket[secondWeek] = 0;

                // Get bug tickets.
                let search_query = 'project = HC AND type = "Bug" and created >= "-' + days + 'd" AND status NOT IN ("Cancelled") order by created desc';
                let search_options = {
                    'maxResults': 5000,
                    'fields': ['created'],
                };

                // Snag the results from Jira.
                jiraApi.searchJira(search_query, search_options).then(response => {
                    if (response.issues.length === 0) {
                        console.log("No issues returned.");
                        process.exit(1);
                    }

                    // Group issues by week created.
                    let issuesByWeek = jiraToolbox.groupByWeek(response.issues, 'created');

                    // Trim first and last weeks in case they have incomplete data.
                    let weeks = Object.keys(issuesByWeek);
                    weeks.nsort();
                    delete issuesByWeek[weeks.shift()];
                    delete issuesByWeek[weeks.pop()];

                    // Print the report.
                    for (let i in issuesByWeek) {
                        if (options.format === "data-only") {
                            console.log(`${i}, ${issuesByWeek[i]}`);
                        } else {
                            console.log(`Week ${i} bugs reported: ${issuesByWeek[i]}`);
                        }
                    }

                    resolve(true);
                }).catch(err => {
                    reject(err);
                });
            });
        }
    },

    wip: {
        label: "WIP vs Backlog Report",
        chain: true,
        process: (jiraApi, options) => {
            return new Promise((resolve, reject) => {
                // Define JQL.
                const wipQuery = 'project = HC AND statusCategory = "In Progress" and type not in (Epic, Initiative, "Test Case") and status not in ("On Hold", Blocked, "Awaiting Feedback")';
                const readyQuery = 'project = HC AND status = "Ready" and type not in (Epic, Initiative, "Test Case")';
                const searchOptions = {
                    'maxResults': 5000,
                    'fields': [],
                };

                // Define promises to get the issues for each query.
                const promises = [
                    new Promise((resolve, reject) => {
                        jiraApi.searchJira(wipQuery, searchOptions).then(response => {
                            if (response.issues.length > 0) {
                                resolve(response.issues);
                            } else {
                                reject("No issues in WIP states.");
                            }
                        });
                    }),
                    new Promise((resolve, reject) => {
                        jiraApi.searchJira(readyQuery, searchOptions).then(response => {
                            if (response.issues.length > 0) {
                                resolve(response.issues);
                            } else {
                                reject("No issues in Ready state.");
                            }
                        });
                    })
                ];

                // Get the issues.
                Promise.all(promises).then(response => {
                    const today = new Date();
                    const wipIssues = response[0];
                    const readyIssues = response[1];
                    const ratio = `${wipIssues.length}:${readyIssues.length}`;
                    const factor = Math.dround(wipIssues.length / readyIssues.length, 2);
                    const text = today.getJiraDateTime() + `: Current WIP to Backlog Factor is ${ratio} or ${factor}:1`;

                    if (options.format === 'log') {
                        // utilities.sendMail({
                        //     subject: "WIP Report",
                        //     text: text
                        // });
                        utilities.logData(text);
                    } else {
                        console.log(text);
                    }
                    resolve(true);
                }).catch(err => {
                    reject(err);
                });
            });
        }
    },

    unplannedWork: {
        label: "Unplanned Work",
        chain: true,
        process: (jiraApi, options) => {
            return new Promise((resolve, reject) => {
                // Get last Monday
                const blg = new Date();
                blg.setLastWeekday('Monday');
                blg.setUTCHours(19, 0);  // Grooming meeting starts at 1pm MT.
                const startTime = blg.getJiraDateTime();

                blg.setHours(blg.getHours() + 1);
                const endTime = blg.getJiraDateTime();

                const mondayQuery = `project = HC AND status changed to Ready after "${startTime}" and status changed to Ready before "${endTime}"`;
                const notMondayQuery = `project = HC AND status changed to Ready after "${endTime}"`;
                const searchOptions = {
                    'maxResults': 5000,
                    'fields': [],
                };

                // Define promises to get the issues for each query.
                const promises = [
                    new Promise((resolve, reject) => {
                        jiraApi.searchJira(mondayQuery, searchOptions).then(response => {
                            if (response.issues.length > 0) {
                                resolve(response.issues);
                            } else {
                                reject("No issues added to the board on Monday.");
                            }
                        });
                    }),
                    new Promise((resolve, reject) => {
                        jiraApi.searchJira(notMondayQuery, searchOptions).then(response => {
                            if (response.issues.length > 0) {
                                resolve(response.issues);
                            } else {
                                reject("No issues added to the board after Backlog Grooming.");
                            }
                        });
                    })
                ];

                // Get the issues.
                Promise.all(promises).then(response => {
                    const mondayIssues = response[0];
                    const unplannedIssues = response[1];

                    console.log(`${mondayIssues.length} issues were added to the Ready column during Backlog Grooming.`);
                    console.log(`${unplannedIssues.length} issues were added to the Ready column after Backlog Grooming.`);
                    resolve(true);
                }, err => {
                    throw err;
                }).catch(err => {
                    reject(err);
                });
            });
        }
    }
};