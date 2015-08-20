'use strict';

var sh = require('shelljs');
var xml2jsFromString = require('xml2js').parseString;

var normalizeInfo = function(xmlString) {
  var infos;

  xml2jsFromString(xmlString,function(err,result){
    infos = result;
  });

  return infos;
};

module.exports = function(path, rev, cb) {
  if(arguments.length === 1) {
    cb = path;
    path = '.';
    rev = 'HEAD';
  } else if(arguments.length === 2) {
    cb = rev;
    rev = 'HEAD';
  }

  if(/\s/.test(path)) {
    path = path
        .replace(/^['"]+/g, '')
        .replace(/["']+$/g, '');
    path = '"' + path + '"';
  }

  sh.exec('svn info ' + path + ' --xml', {silent: true}, function(code, output) {
    if(0 !== code) {
      return cb(new Error('Encountered an error trying to get svn info for ' + path + '\n' + output));
    }
    cb(null, normalizeInfo(output));
  });
};

module.exports.sync = function(path, rev) {
  path = path || '.';
  rev = rev || 'HEAD';

  var cmd = sh.exec('svn info -r ' + rev + ' ' + path + ' --xml', {silent: true});

  if(0 !== cmd.code) {
    throw new Error('Encountered an error trying to get svn info for ' + path + '\n' + cmd.output);
  }
  return normalizeInfo(cmd.output);
};
