const var_dump = require('var_dump');

let Logger = {
  // Log an error to the console.
  error: function (msg, program, err) {
    console.error("☠️  " + msg);

    if (program.debug) {
      console.log(err);
    }

    process.exit(2);
  },

  // Dump a variable.
  dump: function(variable, label) {
    label = label || '';
    console.log("Dumping variable '" + label + "':")
    var_dump(variable);
  }
}

module.exports = Logger;