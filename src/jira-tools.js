#!/usr/bin/env node

const JiraApi = require('jira-client');

/**
 * Tools for working with Jira issues.
 */
module.exports = {
    /**
     * Connect to jiraApi
     */
    connect: function (config) {
        return new JiraApi({
            protocol: new URL(config.jiraApi).protocol || '',
            host: new URL(config.jiraApi).hostname || '',
            username: config.jiraUsername || '',
            password: config.jiraToken || '',
            apiVersion: '2',
            strictSSL: true
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

        // Parse the data into an array with week numbers.
        issues.forEach(issue => {
            let date = new Date(issue.fields[field]);
            let year = date.getFullYear();
            let week = date.getWeek();
            let key = year.toString() + week.toString().padStart(2, "0");
            data[key] = data[key] || 0;
            data[key]++;
        });

        return data;
    }
};
