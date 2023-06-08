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
const CoverageFile = require('./lib/CoverageFile');

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
        currentCoverageFile.parseDA(prefixSplit[1]);
        break;

      case 'BRDA':
        currentCoverageFile.parseBRDA(prefixSplit[1]);
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
        flag: 'r',
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
        flag: 'w+',
      });
      this.push('lcov.info');
      this.emit('end');
    }
  );
};
