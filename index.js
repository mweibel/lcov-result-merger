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
const FullReport = require('./lib/FullReport');

/**
 * Process a lcov input file into the representing Objects
 *
 * @param {string}     sourceDir - The absolute path to the lcov file directory.
 * @param {string}     data
 * @param {FullReport} lcov
 * @param {{}}         config
 *
 * @returns {FullReport}
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

        // If the filepath contains a ':', we want to preserve it.
        currentCoverageFile = lcov.addCoverageFile(
          sourceFileNameParts.slice(1).join(':')
        );

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

module.exports = function (config) {
  const fullReport = new FullReport();

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

      processFile(
        path.dirname(filePath),
        fileContentStr,
        fullReport,
        config || {}
      );

      callback();
    },

    function flush() {
      fs.writeFileSync('lcov.info', Buffer.from(fullReport.toString()), {
        encoding: 'utf-8',
        flag: 'w+',
      });

      this.push('lcov.info');
      this.emit('end');
    }
  );
};
