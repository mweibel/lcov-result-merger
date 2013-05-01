/**
 * LCOV Result merger
 *
 * Author:
 *   Michael Weibel <michael.weibel@gmail.com>
 *
 * Copyright:
 *   2013 Michael Weibel
 *
 * License:
 *   MIT
 */

var glob = require('glob'),
	fs = require('fs');


function processFile(data, lcov) {
	var lines = data.split('\n'),
		currentFileName = '';

	for(var i = 0, l = lines.length; i < l; i++) {
		var line = lines[i];
		if(line === 'end_of_record' || line === '') {
			currentFileName = '';
			continue;
		}

		var prefixSplit = line.split(':'),
			prefix = prefixSplit[0];

		if(prefix === 'SF') {
			currentFileName = prefixSplit[1];
			if(lcov[currentFileName]) {
				continue;
			}
			lcov[currentFileName] = {};
			continue;
		}

		if(prefix === 'DA') {
			var numberSplit = prefixSplit[1].split(','),
				lineNumber = parseInt(numberSplit[0], 10),
				hits = parseInt(numberSplit[1], 10);

			if(lcov[currentFileName][lineNumber]) {
				lcov[currentFileName][lineNumber] += hits;
				continue;
			}
			lcov[currentFileName][lineNumber] = hits;
			continue;
		}

		throw new Error('Unknown Prefix "' + prefix + '"');
	}
	return lcov;
}

function readFiles(files) {
	var lcov = {};
	for(var i = 0, l = files.length; i < l; i++) {
		var file = files[i],
			data = fs.readFileSync(file);
		lcov = processFile(data.toString(), lcov);
	}
	for(var prop in lcov) {
		if(lcov.hasOwnProperty(prop)) {
			process.stdout.write('SF:' + prop + '\n');

			var lines = lcov[prop];
			for(var lineNumber in lines) {
				if(lines.hasOwnProperty(lineNumber)) {
					var hits = lines[lineNumber];
					process.stdout.write('DA:' + lineNumber + ',' + hits + '\n');
				}
			}
			process.stdout.write('end_of_record\n');
		}
	}
}


module.exports = function(files) {
	var options = {};
	glob(files, options, function(err, files) {
		if(err) {
			throw new Error(err);
		}
		readFiles(files);
	});
};