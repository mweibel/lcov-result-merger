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

var through2 = require('through2')
  , File = require('vinyl');

/*
 * Object to represent DA record
 */
function DA(lineNumber, hits) {
  this.lineNumber = lineNumber;
  this.hits = hits;
}

/*
 * Object to represent BRDA record
 */
function BRDA(lineNumber, blockNumber, branchNumber, hits) {
  this.lineNumber = lineNumber;
  this.blockNumber = blockNumber;
  this.branchNumber = branchNumber;
  this.hits = hits;
}

/*
 * Object to represent coverage file and it's DA/BRDA records
 */
function coverageFile(filename) {
  this.filename = filename;
  this.DARecords = [];
  this.BRDARecords = [];
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
    if (source[i].blockNumber === blockNumber &&
      source[i].branchNumber === branchNumber &&
      source[i].lineNumber === lineNumber) {
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

    var numberSplit, lineNumber, hits;

    if(prefix === 'DA') {
      numberSplit = prefixSplit[1].split(',');
      lineNumber = parseInt(numberSplit[0], 10);
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
      numberSplit = prefixSplit[1].split(',');
      lineNumber = parseInt(numberSplit[0], 10);
      var blockNumber = parseInt(numberSplit[1], 10),
        branchNumber = parseInt(numberSplit[2], 10);
      hits = parseInt(numberSplit[3], 10);
      var existingBRDA = findBRDA(currentCoverageFile.BRDARecords,
                  blockNumber, branchNumber, lineNumber);
      if(existingBRDA) {
        existingBRDA.hits += hits;
        continue;
      }
      var newBRDA = new BRDA(lineNumber, blockNumber, branchNumber, hits);
      currentCoverageFile.BRDARecords.push(newBRDA);
      continue;
    }
    // We could throw an error here, or, we could simply ignore it, since
    // we're not interested.
    // throw new Error('Unknown Prefix "' + prefix + '"');
  }
  return lcov;
}

/*
 * Creates LCOV records for given list of files.
 */
function createRecords(coverageFiles) {
  return coverageFiles.map(function(coverageFile) {
    var header = 'SF:' + coverageFile.filename + '\n';
    var footer = 'end_of_record\n';
    var body = coverageFile.DARecords.map(function(daRecord) {
      return 'DA:' + daRecord.lineNumber + ',' +
        daRecord.hits + '\n';
    }).join('') + coverageFile.BRDARecords.map(function(brdaRecord) {
      return 'BRDA:' + brdaRecord.lineNumber + ',' +
        brdaRecord.blockNumber + ',' + brdaRecord.branchNumber + ',' +
        brdaRecord.hits + '\n';
    }).join('');
    return header + body + footer;
  }).join('');
}

module.exports = function() {
  var coverageFiles = [];
  return through2.obj(function process(file, encoding, callback) {
    if (file.isNull()) {
      callback();
      return;
    }
    if (file.isStream()) {
      throw new Error('Streaming not supported');
    }
    coverageFiles = processFile(file.contents.toString(), coverageFiles);
    callback();
  }, function flush() {
    var file = new File({
      path: 'lcov.info',
      contents: new Buffer(createRecords(coverageFiles))
    });
    this.push(file);
    this.emit('end');
  });
};
