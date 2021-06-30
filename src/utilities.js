/**
 * Collection of general utility methods.
 */
require('./prototype');
const nodemailer = require('nodemailer');
const fs = require('fs');

module.exports = {
    sendMail: (options) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: '',
                pass: ''
            }
        });

        let mailOptions = {
            from: '',
            to: '',
            subject: options.subject || '',
            text: options.text || ''
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    },

    logData: (data) => {
        const logfile = '/Users/Chris/www/htdocs/lullabot/ibm-reporting/logs/wip.log';
        fs.writeFile(logfile, data + "\n", { flag: 'a+' }, err => {
            if (err) {
                return console.error(err);
            }
        });
    }
}