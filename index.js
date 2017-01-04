#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var Promise = require('bluebird');
var _ = require('lodash');

program
  .version('0.0.1')
  .usage('[options] <file ...>')

  .option('-b, --binary', 'read in binary mode')
  .option('-c, --check', 'read SHA384 sums from the FILEs and check them')
  .option('--tag', 'create a BSD-style checksum')
  .option('-t, --text ', 'read in text mode (default)')

  .option('--base64', 'Output hash in base64')
  .option('-s, --sri', 'SRI output format for hash (sha384- prefix and base64)')

  .option('--ignore-missing', 'don\'t fail or report status for missing files')
  .option('--quiet', 'don\'t print OK for each successfully verified file')
  .option('--status', 'don\'t output anything, status code shows success')
  .option('--strict', 'exit non-zero for improperly formatted checksum lines')
  .option('-w, --warn', 'warn about improperly formatted checksum lines')

  .parse(process.argv);


var fs = Promise.promisifyAll(require("fs"));
var SHA384 = require("crypto-js/sha384");
var CryptoJS = require('crypto-js');

function hashFile(filename, data, params) {
  var hash;
  if (params.base64) {
    hash = CryptoJS.enc.Base64.stringify(SHA384(data))
  }
  else {
    hash = SHA384(data).toString()
  }

  if (params.sri) {
    hash = 'sha384-' + hash
  }

  return hash;
}

function checkFromFile(filename, data, params) {
  var lines = data.split("\n").filter(function(e){ return e }); 
  var bad_count = params.bad_count || 0;

  if (!lines.length) {
    if (bad_count > 0) {
      console.log(program.name()+": WARNING: "+bad_count+" computed checksum did NOT match");
      process.exit(1); 
    }
    return;
  }  

  var line = lines.shift();
  var match, file, hash;

  if (match = line.match(/^SHA384 \(([^ ]*)\) = ([^ ]*)$/)) {
    file = match[1];
    hash = match[2];
  }
  else if (match = line.match(/^([^ ]*)  ([^ ]*)$/)) {
    hash = match[1];
    file = match[2];
  }
  else {
    if (program.warn) {
      console.log("WARN: couldn't parse line");
    }
    if (program.strict) {
      process.exit(1);
    }
    return checkFromFile(filename, lines.join("\n"), params);
  }

  return processFile(file, {
    isBinary: program.binary && program.text == undefined, 
    checkToHash: hash
  }).then(function(failed_count) {
    return checkFromFile(filename, lines.join("\n"), _.extend(params, { bad_count: bad_count + failed_count }));
  });
}

function processFile(filename, params) {
  var opts = { encoding: 'utf8' };
  if (program.isBinary) {
    opts = undefined;
  }

  return fs.readFileAsync(filename, opts).then(function (data) {
    if (params.isCheckFromFile) {
      return checkFromFile(filename, data, params);
    }

    var hash = hashFile(filename, data, _.extend(params, { 
      base64: program.base64 || program.sri, 
      sri: program.sri 
    }));

    if (params.isPrint) {
      if (program.tag) {
        console.log("SHA384 (" +filename+ ") = " +hash)
      }
      else {
        console.log(hash +"  "+ filename)
      } 
    }

    if (params.checkToHash) {
      if (params.checkToHash == hash) {
        if (program.quiet == undefined && program.status == undefined) {
          console.log(filename + ": OK")
        }
        return 0;
      }
      else {
        if (program.status == undefined) {
          console.log(filename + ": FAILED")
        }
        return 1;
      }
    }
  })
  .catch(function(err) {
    if (err.code == 'ENOENT') {
      if (program.ignoreMissing && params.checkToHash) {
        return;
      }
    }
    throw err;
  });

}

function fileChain() {
  if (!program.args.length) {
    return;
  }
  var filename = program.args.shift();

  return processFile(filename, {
    isBinary: program.binary && program.text == undefined, 
    isCheckFromFile: program.check,
    isPrint: true
  }).then(function() {
    return fileChain();
  });
}

fileChain();
