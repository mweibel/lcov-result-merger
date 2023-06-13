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
const Configuration = require('./lib/Configuration');
const FullReport = require('./lib/FullReport');

/**
 * Process a lcov input file into the representing Objects
 *
 * @param {string} sourceDir - The absolute path to the lcov file directory.
 * @param {string} data
 * @param {FullReport} lcov
 * @param {Configuration} config
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

        if (config.prependSourceFiles) {
          const fullFilePathName = path.normalize(
            path.join(
              sourceDir,
              config.prependPathFix,
              prefixSplit.slice(1).join(':')
            )
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

/**
 * @param {import("./lib/Configuration").ConfigurationPojo} options
 * @return {*}
 */
module.exports = function mergeCoverageReportFiles(options) {
  const config = new Configuration(options);
  const report = new FullReport();

  return through.obj(
    function (filePath, encoding, callback) {
      if (!fs.existsSync(filePath)) {
        callback();
        return;
      }

      const fileContent = fs.readFileSync(filePath, {
        encoding: 'utf8',
        flag: 'r',
      });

      processFile(path.dirname(filePath), fileContent, report, config);
      callback();
    },

    function flush() {
      fs.writeFileSync('lcov.info', Buffer.from(report.toString()), {
        encoding: 'utf-8',
        flag: 'w+',
      });

      this.push('lcov.info');
      this.emit('end');
    }
  );
};
