#!/usr/bin/env node

require('./src/prototype');

// A simple promise that resolves after {ts}ms
const getWord = () => {
    return new Promise((resolve, reject) => {
        let words = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel'];
        const ri = Math.floor(Math.random() * words.length);
        resolve(words[ri]);
    });
};

let promises = [];
for (let i = 0; i < 10; i++) {
    promises.push(getWord());
}

// Promise.all
Promise.all(promises).then(results => console.log(results));
