var mocha    = require('mocha');
var inherits = require('util').inherits;
var request  = require('sync-request');

module.exports = Reporter;

function Reporter(runner, opts) {
  var pending = 0;
  var failures = 0;
  var passes = 0;

  var options = opts && opts.reporterOptions || {};

  runner.on('pass', (test) => {
    passes++;
  });

  runner.on('fail', (test) => {
    failures++;
  });

  runner.on('pending', (test) => {
    pending++;
  });

  runner.once('end', () => {
    if (!options.failuresOnly || failures) {

      var text = options.text
        .replace(/{{\s*failures\s*}}/g, failures)
        .replace(/{{\s*passes\s*}}/g, passes)
        .replace(/{{\s*pending\s*}}/g, pending)

      var json = {
        src: options.src,
        dst: options.dst,
        text: text
      };

      var res = request('POST', 'https://api.plivo.com/v1/Account/' + options.authId + '/Message/', {
        headers: {
          "Authorization": 'Basic ' + new Buffer(options.authId + ':' + options.authToken).toString('base64'),
          "Content-Type": "application/json"
        },
        json: json
      });
    }
  });
}

inherits(Reporter, mocha.reporters.Base);
