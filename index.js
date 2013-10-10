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
	fs = require('fs'),
	path = require('path'),
	cwd = process.cwd();

/*
 * Object to represent DA record
 */
function DA (lineNumber, hits) {
	this.lineNumber = lineNumber
	this.hits = hits
}

/*
 * Object to represent BRDA record
 */
function BRDA (lineNumber, blockNumber, branchNumber, hits) {
	this.lineNumber = lineNumber
	this.blockNumber = blockNumber
	this.branchNumber = branchNumber
	this.hits = hits
}

/*
 * Object to represent coverage file and it's DA/BRDA records
 */
function coverageFile(filename) {
	this.filename = filename;
	this.DARecords = []
	this.BRDARecords = []
}

/*
 * Will find an existing DA record
 */
function findDA(source, lineNumber) {
	for (var i=0; i < source.length; i++) {
		if (source[i].lineNumber === lineNumber) {
			return source[i];
		}
	}
	return null;
}

/*
 * Will find an existing BRDA record
 */
function findBRDA(source, blockNumber, branchNumber, lineNumber) {
	for (var i=0; i < source.length; i++) {
		if (source[i].blockNumber === blockNumber
			&& source[i].branchNumber === branchNumber
			&& source[i].lineNumber === lineNumber) {
			return source[i];
		}
	}
	return null;
}

/*
 * will find an existing coverage file
 */
function findCoverageFile(source, filename) {
	for (var i=0; i < source.length; i++) {
		if (source[i].filename === filename) {
			return source[i];
		}
	}
	return null;
}

/*
 * Process a lcov input file into the representing Objects
 */
function processFile(data, lcov) {
	var lines = data.split('\n'),
		currentFileName = '',
		currentCoverageFile = null;

	for(var i = 0, l = lines.length; i < l; i++) {
		var line = lines[i];
		if(line === 'end_of_record' || line === '') {
			currentFileName = '';
			currentCoverageFile = null;
			continue;
		}

		var prefixSplit = line.split(':'),
			prefix = prefixSplit[0];

		if(prefix === 'SF') {
			currentFileName = prefixSplit[1];
			currentCoverageFile = findCoverageFile(lcov, currentFileName);
			if(currentCoverageFile) {
				continue;
			}
			currentCoverageFile = new coverageFile(currentFileName);
			lcov.push(currentCoverageFile);
			continue;
		}

		if(prefix === 'DA') {
			var numberSplit = prefixSplit[1].split(','),
				lineNumber = parseInt(numberSplit[0], 10),
				hits = parseInt(numberSplit[1], 10);
			var existingDA = findDA(currentCoverageFile.DARecords, lineNumber);
			if(existingDA) {
				existingDA.hits += hits;
				continue;
			}
			var newDA = new DA(lineNumber, hits);
			currentCoverageFile.DARecords.push(newDA);
			continue;
		}

		if(prefix === 'BRDA') {
			var numberSplit = prefixSplit[1].split(','),
				lineNumber = parseInt(numberSplit[0], 10),
				blockNumber = parseInt(numberSplit[1], 10),
				branchNumber = parseInt(numberSplit[2], 10),
				hits = parseInt(numberSplit[3], 10);
			var existingBRDA = findBRDA(currentCoverageFile.BRDARecords, blockNumber, branchNumber, lineNumber);
			if(existingBRDA) {
				existingBRDA.hits += hits;
				continue;
			}
			var newBRDA = new BRDA(lineNumber, blockNumber, branchNumber, hits);
			currentCoverageFile.BRDARecords.push(newBRDA);
			continue;
		}
		//We could throw an error here, or, we could simply ignore it, since we're not interested.
		//throw new Error('Unknown Prefix "' + prefix + '"');
	}
	return lcov;
}

/*
 * Helper function to write output to either file or stdout
 */
function writer(filePath, data) {
	if (filePath) {
		fs.appendFileSync(filePath, data);
	} else {
		process.stdout.write(data);
	}
}

/*
 * Read in the multiple lcov files and merge them into one output
 */
function mergeFiles(files, filePath) {
	var lcov = [];
	for(var i = 0, l = files.length; i < l; i++) {
		var file = files[i],
			data = fs.readFileSync(file);
		lcov = processFile(data.toString(), lcov);
	}
	for (var fileIndex in lcov) {
		var coverageFile = lcov[fileIndex];
		writer(filePath, 'SF:' + coverageFile.filename + '\n');
		for (var daIndex in coverageFile.DARecords) {
			var daRecord = coverageFile.DARecords[daIndex];
			writer(filePath, 'DA:' + daRecord.lineNumber + ',' + daRecord.hits + '\n');
		}
		for (var brdaIndex in coverageFile.BRDARecords) {
			var brdaRecord = coverageFile.BRDARecords[brdaIndex];
			writer(filePath, 'BRDA:' + brdaRecord.lineNumber + ',' + brdaRecord.blockNumber + ','
				+ brdaRecord.branchNumber + ',' + brdaRecord.hits + '\n');
		}
		writer(filePath, 'end_of_record\n');
	}
}

/*
 This will determine if the filepath is relative or absolute.
 If relative, it will return the full absolute path based on CWD.
 */
function getFilePath(outputFile) {
	if (outputFile) {
		if (outputFile.match("^/") == "/") {
			return outputFile;
		} else {
			return path.join(cwd, "/", outputFile);
		}
	}
	return null;
}

module.exports = function() {

	if (process.argv.length < 3) {
		console.error("");
		console.error("Usage: node lcov-result-merger 'pattern' ['output file']");
		console.error("EX: node lcov-result-merger 'target/**/lcov.out' 'target/lcov-merged.out'");
		console.error("");
		process.exit(1);
	}
	var files = process.argv[2];
	var outputFile = process.argv[3];
	var filePath = getFilePath(outputFile);
	if (filePath && fs.existsSync(filePath)) {
		fs.unlinkSync(filePath);
	}
	var options = {};
	glob(files, options, function(err, files) {
		if(err) {
			throw new Error(err);
		}
		mergeFiles(files, filePath);
	});
};