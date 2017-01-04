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
  .option('-t, --text ', 'read in text mode (default)', {isDefault: true})

  .option('--base64', 'Output hash in base64')
  .option('-s, --sri', 'SRI output format for hash (sha384- prefix and base64)')
  
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

function checkFromFile(filename, data) {
  var lines = data.split("\n")
  var line = lines.shift();
  if (line == undefined || line == "") {
    return;
  }

  var match, file, hash;

  if (match = line.match(/^SHA384 \(([^ ]*)\) = ([^ ]*)$/)) {
    file = match[1]
    hash = match[2]
  }
  else if (match = line.match(/^([^ ]*)  ([^ ]*)$/)) {
    hash = match[1]
    file = match[2]
  }
  else {
    console.log("WARN: couldn't parse line");
  }

  return processFile(file, {
    isBinary: program.binary && program.text == undefined, 
    checkToHash: hash
  }).then(function() {
    return checkFromFile(filename, lines.join("\n"));
  });
}

function processFile(filename, params) {
  var opts = { encoding: 'utf8' };
  if (program.isBinary) {
    opts = undefined
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
        console.log("SHA384 ("+filename+") = "+hash)
      }
      else {
        console.log(hash +"  "+ filename)
      } 
    }
    if (params.checkToHash) {
      if (params.checkToHash == hash) {
        console.log(filename + ": OK")
      }
      else {
        console.log(filename + ": FAILED")
      }
    }

  });
}

function fileChain() {
  var filename = program.args.shift();
  if (filename == undefined) {
    return;
  }

  return processFile(filename, {
    isBinary: program.binary && program.text == undefined, 
    isCheckFromFile: program.check,
    isPrint: true
  }).then(function() {
    return fileChain();
  });
}
fileChain();
