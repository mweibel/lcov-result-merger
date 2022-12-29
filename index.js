/**
 * LCOV result merger
 *
 * @author Michael Weibel <michael.weibel@gmail.com>
 * @copyright 2013-2016 Michael Weibel
 * @license MIT
 */

const through = require('through2');
const fs = require('fs');
const path = require('path');

/**
 * Represents a DA record
 *
 * @param {number} lineNumber
 * @param {number} hits
 *
 * @constructor
 */
function DA(lineNumber, hits) {
  this.lineNumber = lineNumber;
  this.hits = hits;
}

/**
 * Generates a DA string
 *
 * @returns {string}
 */
DA.prototype.toString = function () {
  return 'DA:' + this.lineNumber + ',' + this.hits + '\n';
};

/**
 * Represents a BRDA record
 *
 * @param {number} lineNumber
 * @param {number} blockNumber
 * @param {number} branchNumber
 * @param {number} hits
 *
 * @constructor
 */
function BRDA(lineNumber, blockNumber, branchNumber, hits) {
  this.lineNumber = lineNumber;
  this.blockNumber = blockNumber;
  this.branchNumber = branchNumber;
  this.hits = hits;
}

/**
 * Generates a BRDA string
 *
 * @returns {string}
 */
BRDA.prototype.toString = function () {
  let str = 'BRDA:';
  str += [this.lineNumber, this.blockNumber, this.branchNumber, this.hits].join(
    ','
  );
  str += '\n';

  return str;
};

/**
 * Represents a coverage file, and it's DA/BRDA records
 *
 * @param {string} filename
 *
 * @constructor
 */
function CoverageFile(filename) {
  this.filename = filename;
  this.DARecords = [];
  this.BRDARecords = [];
}

/**
 * Generates a coverage report for a file.
 *
 * @returns {string}
 */
CoverageFile.prototype.toString = function () {
  const header = 'SF:' + this.filename + '\n';
  const footer = 'end_of_record\n';

  let body = this.DARecords.map(function (daRecord) {
    return daRecord.toString();
  }).join('');

  body += this.BRDARecords.map(function (brdaRecord) {
    return brdaRecord.toString();
  }).join('');

  return header + body + footer;
};

/**
 * Find an existing DA record
 *
 * @param {DA[]}     source
 * @param {number} lineNumber
 *
 * @returns {DA|null}
 */
function findDA(source, lineNumber) {
  for (let i = 0; i < source.length; i++) {
    const da = source[i];
    if (da.lineNumber === lineNumber) {
      return da;
    }
  }
  return null;
}

/**
 * Find an existing BRDA record
 *
 * @param {BRDA[]}   source
 * @param {number} blockNumber
 * @param {number} branchNumber
 * @param {number} lineNumber
 *
 * @returns {BRDA|null}
 */
function findBRDA(source, blockNumber, branchNumber, lineNumber) {
  for (let i = 0; i < source.length; i++) {
    const brda = source[i];
    if (
      brda.blockNumber === blockNumber &&
      brda.branchNumber === branchNumber &&
      brda.lineNumber === lineNumber
    ) {
      return brda;
    }
  }
  return null;
}

/**
 * Find an existing coverage file
 *
 * @param {CoverageFile[]} source
 * @param {string}         filename
 *
 * @returns {CoverageFile|null}
 */
function findCoverageFile(source, filename) {
  for (let i = 0; i < source.length; i++) {
    const file = source[i];
    if (file.filename === filename) {
      return file;
    }
  }
  return null;
}

/**
 * Returns appropriate number of hits based on the string value of hits.
 *
 * @param {string} hits
 *
 * @returns {number}
 */
function numericHits(hits) {
  if (hits === '-') {
    return 0;
  }
  return parseInt(hits, 10);
}

/**
 * Merges BRDA hits.
 *
 * @param {string} existingBRDAHits
 * @param {string} newBRDAHits
 *
 * @returns {number|string}
 */
function mergedBRDAHits(existingBRDAHits, newBRDAHits) {
  // If we've never executed the branch code path in an existing coverage
  // record, and we've never executed it here either, then keep it as '-'
  // (eg, never executed). If either of them is a number, then
  // use the number value.
  if (existingBRDAHits !== '-' || newBRDAHits !== '-') {
    return numericHits(existingBRDAHits) + numericHits(newBRDAHits);
  }

  return '-';
}

/**
 * Splits the second part of the prefix into an array. The array
 * is a list of strings which represent numbers.
 *
 * @param {string[]} prefixSplit
 *
 * @returns {string[]}
 */
function splitNumbers(prefixSplit) {
  return prefixSplit[1].split(',');
}

/**
 * Parses an SF section
 *
 * @param {CoverageFile[]} lcov
 * @param {string[]}       prefixSplit
 *
 * @returns {CoverageFile|null}
 */
function parseSF(lcov, prefixSplit) {
  // If the filepath contains a ':', we want to preserve it.
  prefixSplit.shift();
  const currentFileName = prefixSplit.join(':');
  let currentCoverageFile = findCoverageFile(lcov, currentFileName);
  if (currentCoverageFile) {
    return currentCoverageFile;
  }
  currentCoverageFile = new CoverageFile(currentFileName);
  lcov.push(currentCoverageFile);

  return currentCoverageFile;
}

/**
 * Parses a DA section
 *
 * @param {CoverageFile} currentCoverageFile
 * @param {string[]}     prefixSplit
 */
function parseDA(currentCoverageFile, prefixSplit) {
  const numberSplit = splitNumbers(prefixSplit);
  const lineNumber = parseInt(numberSplit[0], 10);
  const hits = parseInt(numberSplit[1], 10);

  const existingDA = findDA(currentCoverageFile.DARecords, lineNumber);
  if (existingDA) {
    existingDA.hits += hits;
    return;
  }

  currentCoverageFile.DARecords.push(new DA(lineNumber, hits));
}

/**
 * Parses a BRDA section
 *
 * @param {CoverageFile} currentCoverageFile
 * @param {string[]}     prefixSplit
 */
function parseBRDA(currentCoverageFile, prefixSplit) {
  const numberSplit = splitNumbers(prefixSplit);
  const lineNumber = parseInt(numberSplit[0], 10);
  const blockNumber = parseInt(numberSplit[1], 10);
  const branchNumber = parseInt(numberSplit[2], 10);

  const existingBRDA = findBRDA(
    currentCoverageFile.BRDARecords,
    blockNumber,
    branchNumber,
    lineNumber
  );

  // Special case, hits might be a '-'. This means that the code block
  // where the branch was contained was never executed at all (as opposed
  // to the code being executed, but the branch not being taken). Keep
  // it as a string and let mergedBRDAHits work it out.
  const hits = numberSplit[3];

  if (existingBRDA) {
    existingBRDA.hits = mergedBRDAHits(existingBRDA.hits, hits);
    return;
  }

  currentCoverageFile.BRDARecords.push(
    new BRDA(lineNumber, blockNumber, branchNumber, hits)
  );
}

/**
 * Process a lcov input file into the representing Objects
 *
 * @param {string}         sourceDir - The absolute path to the lcov file directory.
 * @param {string}         data
 * @param {CoverageFile[]} lcov
 * @param {{}}             config
 *
 * @returns {CoverageFile[]}
 */
function processFile(sourceDir, data, lcov, config) {
  const lines = data.split(/\r?\n/);
  let currentCoverageFile = null;

  for (let i = 0, l = lines.length; i < l; i++) {
    const line = lines[i];
    if (line === 'end_of_record' || line === '') {
      currentCoverageFile = null;
      continue;
    }

    const prefixSplit = line.split(':');
    const prefix = prefixSplit[0];

    switch (prefix) {
      case 'SF': {
        let sourceFileNameParts = prefixSplit;

        if (config['prepend-source-files']) {
          const pathFix =
            typeof config['prepend-path-fix'] === 'string'
              ? config['prepend-path-fix']
              : '..';

          const fullFilePathName = path.normalize(
            path.join(sourceDir, pathFix, prefixSplit.slice(1).join(':'))
          );
          const rootRelPathName = path.relative(
            process.cwd(),
            fullFilePathName
          );
          sourceFileNameParts = [prefix].concat(
            ('./' + rootRelPathName).split(':')
          );
        }

        currentCoverageFile = parseSF(lcov, sourceFileNameParts);
        break;
      }
      case 'DA':
        parseDA(currentCoverageFile, prefixSplit);
        break;
      case 'BRDA':
        parseBRDA(currentCoverageFile, prefixSplit);
        break;
      default:
      // do nothing with not implemented prefixes
    }
  }
  return lcov;
}

/**
 * Creates LCOV records for given list of files.
 *
 * @param {CoverageFile[]} coverageFiles
 *
 * @returns {string}
 */
function createRecords(coverageFiles) {
  return coverageFiles
    .sort(function (fileA, fileB) {
      return fileA.filename.localeCompare(fileB.filename);
    })
    .map(function (coverageFile) {
      return coverageFile.toString();
    })
    .join('');
}

module.exports = function (config) {
  let coverageFiles = [];
  return through.obj(
    function (filePath, encoding, callback) {
      if (!fs.existsSync(filePath)) {
        callback();
        return;
      }
      const fileContentStr = fs.readFileSync(filePath, {
        encoding: 'utf8',
        flag: 'r'
      });
      coverageFiles = processFile(
        path.dirname(filePath),
        fileContentStr,
        coverageFiles,
        config || {}
      );
      callback();
    },
    function flush() {
      fs.writeFileSync('lcov.info', Buffer.from(createRecords(coverageFiles)), {
        encoding: 'utf-8',
        flag: 'w+'
      });
      this.push('lcov.info');
      this.emit('end');
    }
  );
};
