#!/usr/bin/env node
/**
 * Left-pad a string.
 *
 * @param padString
 * @param length
 * @returns {string}
 */
String.prototype.lpad = function (padString, length) {
    let str = '';
    const toPad = length - this.length;

    while (str.length < toPad) {
        str += padString;
    }

    return str + this;
}

/**
 * A set of tools for advanced date handling.
 */

/**
 * Returns the ISO week of the date.
 */
Date.prototype.getWeek = function () {
    const date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);

    // Thursday in current week decides the year.
    // date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);

    // January 1 is in ISO week 1.
    const week1 = new Date(date.getFullYear(), 0, 1);

    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    // const weekNum =  1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    const weekNum =  1 + Math.ceil(((date.getTime() - week1.getTime()) / 86400000) / 7);
    return weekNum;
}

Date.prototype.getFullWeek = function() {
    const year = this.getFullYear();
    const week = this.getWeek();
    return year.toString() + '/' + week.toString().padStart(2, "0");
}

/**
 * Set the date to the previous weekday as specified.
 *
 * @param dow
 */
Date.prototype.setLastWeekday = function(dow) {
    dow = dow.toLowerCase().substring(0, 3);
    const dowMap = {'mon': 0, 'tue': 1, 'wed': 2, 'thu': 3, 'fri': 4, 'sat': 5, 'sun': 6};

    // How many days ago was the last day specified?
    const diff = this.getDay() - dowMap[dow];

    if (diff > 0) {
        this.setDate(this.getDate() - (diff - 1));
    }
    else {
        this.setDate(this.getDate() - (diff + 6));
    }
}

/**
 * Get the actual numerical representation of a month.
 *
 * @returns {number}
 */
Date.prototype.getRealMonth = function() {
    return this.getMonth() + 1;
}

/**
 * Get a Jira formatted date and time string.  Unpadded values are OK.
 *
 * @returns {string}
 */
Date.prototype.getJiraDateTime = function() {
    return `${this.getFullYear()}/${this.getRealMonth().toString().lpad("0", 2)}/${this.getDate().toString().lpad("0", 2)} ${this.getHours().toString().lpad("0", 2)}:${this.getMinutes().toString().lpad("0", 2)}`;
}

Date.prototype.setWeekStart = function(offset) {
    offset = offset || 0;

    let weekOffset = 7 * offset;
    let dow = this.getDay();

    // Set to Monday.
    this.setDate(this.getDate() + weekOffset - dow + 1);
    this.setHours(0, 0, 0, 0);
};

Date.prototype.setWeekEnd = function(offset) {
    offset = offset || 0;

    let weekOffset = 7 * offset;
    let dow = 6 - this.getDay();
    this.setDate(this.getDate() + dow + weekOffset);
    this.setHours(23, 59, 59, 999);
};

/**
 * Sort an array numerically instead of lexographically.
 */
Array.prototype.nsort = function () {
    this.sort((a, b) => parseInt(a) - parseInt(b));
}

/**
 * Round a number to the nearest decimal point.
 *
 * @param num
 * @param decimalPlaces
 * @returns {number}
 */
Math.dround = function(num, decimalPlaces) {
    decimalPlaces = decimalPlaces || 0;
    const factor = Math.pow(10, decimalPlaces);
    // const factor = 10**decimalPlaces;  // ES7

    if (decimalPlaces === 0) {
        return Math.round(num);
    }
    else {
        return Math.round(num * factor) / factor;
    }
}