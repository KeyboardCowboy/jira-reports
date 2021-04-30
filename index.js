#!/usr/bin/env node

/**
 * @file
 * Runs a series of reports against the IBM Cloud Jira project.
 */

// Instantiate global variables.
// var jira = {};
// let config = {};

// Load dependencies.
require('./src/utils');
const program = require('commander');
const jiraToolbox = require('./src/jira-tools');
const logger = require('./src/logger');
const config = require('./config.js') || {};

// Parse arguments into program.
program
  .option('-d, --days <integer>', 'The number of days of history to retrieve.  Defaults to 90.')
  .option('-a, --avg <integer>', 'Number of weeks to include in the rolling average.  Defaults to 4.')
  .option('-g, --debug <bool>', 'Print full error messages. (Optional)')
  .parse(process.argv);

// Create connection to Jira.
let connectToJira = new Promise((resolve, reject) =>  {
  try {
    let jira = jiraToolbox.connect(config);
    resolve(jira);
  }
  catch (err) {
    reject(err);
  }
}).catch(error => {
  logger.error("Unable to connect to Jira at " + config.jiraApi, program, error);
});

// Process the weekly velocity.
connectToJira.then(jira => {
  // Get resolved tickets.
  const days = program.days || 90;
  let search_query = 'project = HC AND resolutiondate >= "-' + days + 'd" AND status NOT IN ("Cancelled") order by resolved desc';
  let search_options = {
    'maxResults': 5000,
    'fields': ['resolutiondate'],
  };

  // Snag the results from Jira.
  jira.searchJira(search_query, search_options).then(response => {
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
    let interval = parseInt(program.avg) || 4;
    const max = weeks.length;
    while ((j + interval) < max + 1) {
      let tot = 0;
      for (let i = j; i < (interval + j); i++) {
        console.log("Week " + weeks[i] + " velocity: " + issuesByWeek[weeks[i]]);
        tot = tot + parseInt(issuesByWeek[weeks[i]]);
      }

      let avg = Math.round(tot/interval);
      console.log(interval + " week rolling average: " + avg + '\n');
      j = j + 1;
    }
  }).catch(error => {
    console.error(error);
  });
});
