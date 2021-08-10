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
     * @param {object} bucket
     * @param {array} issues
     * @param {string} field
     */
    groupByWeek: function (bucket, issues, field) {
        // Parse the data into an array with week numbers.
        issues.forEach(issue => {
            let date = new Date(issue.fields[field]);
            let key = date.getFullWeek();
            bucket[key].count++;
        });

        return bucket;
    }
};

module.exports = JiraTools;