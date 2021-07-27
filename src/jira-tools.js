#!/usr/bin/env node

const JiraApi = require('jira-client');

/**
 * Tools for working with Jira issues.
 */
JiraTools = {
    /**
     * Connect to jiraApi
     */
    connect: function (config) {
        return new Promise((resolve, reject) => {
            let jira = new JiraApi({
                protocol: new URL(config.jiraApi).protocol || '',
                host: new URL(config.jiraApi).hostname || '',
                username: config.jiraUsername || '',
                password: config.jiraToken || '',
                apiVersion: '2',
                strictSSL: true
            });

            resolve(jira);
        });
    },

    /**
     * Group an array of Jira issues by a week using a date field.
     *
     * @todo
     *   1. Verify that the field exists on the object.
     *   2. General error handling.
     * @param {array} issues
     * @param {string} field
     */
    groupByWeek: function (issues, field) {
        let data = {};

        // Ensure we have an entry for every week in the range so there are no gaps in weeks.
        const firstWeek = JiraTools.getWeekString(issues[0].fields[field]);

        // Parse the data into an array with week numbers.
        issues.forEach(issue => {
            let date = new Date(issue.fields[field]);
            let key = JiraTools.getWeekString(date);
            data[key] = data[key] || 0;
            data[key]++;
        });

        return data;
    },

    /**
     * Get a consistent week string including year.
     *
     * @param date
     * @returns {string}
     */
    getWeekString: (date) => {
        const year = date.getFullYear();
        const week = date.getWeek();
        return year.toString() + week.toString().padStart(2, "0");
    }
};

module.exports = JiraTools;