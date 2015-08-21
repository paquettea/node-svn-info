'use strict';

var sh = require('shelljs');
var xml2jsFromString = require('xml2js').parseString;

var normalizeInfo = function (xmlString) {
	var infos;

	xml2jsFromString(xmlString, function (err, result) {
		infos = result;
	});

	return infos;
};

var getRevision = function (rev) {
	return typeof rev === "string" ? ' -r ' + rev + ' ' : ' ';
};

var getSVNInfoCmd = function (path, rev) {
	return 'svn info' + getRevision(rev) + getDirectoryPath(path) + ' --xml'
};

var getDirectoryPath = function (path) {
	var outputPath = path ? path : '.';

	if (/\s/.test(path)) {
		outputPath = path
			.replace(/^['"]+/g, '')
			.replace(/["']+$/g, '');
		outputPath = '"' + outputPath + '"';
	}

	return outputPath;
};

module.exports = function (path, rev, cb) {

	var callback;
	var dirPath = path;

	if (arguments.length === 1) {
		callback = path;
		dirPath = '.';
	} else if (arguments.length === 2) {
		callback = rev;

	} else {
		callback = cb;

	}

	sh.exec('svn info ' + getRevision(rev) + getDirectoryPath(path) + ' --xml', {silent: true}, function (code, output) {
		if (0 !== code) {
			return callback(new Error('Encountered an error trying to get svn info for ' + path + '\n' + output));
		}
		cb(null, normalizeInfo(output));
	});
};

module.exports.sync = function (path, rev) {

	var cmd = sh.exec(getSVNInfoCmd(path, rev), {silent: true});

	if (0 !== cmd.code) {
		throw new Error('Encountered an error trying to get svn info for ' + path + '\n' + cmd.output);
	}
	return normalizeInfo(cmd.output);
};
