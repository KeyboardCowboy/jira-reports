#!/usr/bin/env node

require('./src/prototype');

const daysAgo = 90;
const bucket = {};

// Build a collection object to aggregate data.
let date = new Date();
date.setDate(`-${daysAgo}`);
date.setWeekStart();

let endDate = new Date();

while (date.getTime() < endDate.getTime()) {
    let week = date.getFullWeek();
    console.log(week);
    bucket[week] = {weekStarts: date.toString()};
    date.setDate(date.getDate() + 7);
}

let x=0;