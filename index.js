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
  /** @type {import("./lib/CoverageFile")|null} */
  let currentCoverageFile = null;

  const lines = data.split(/\r?\n/);

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (line === 'end_of_record' || line === '') {
      currentCoverageFile = null;
      continue;
    }

    const [prefix, ...suffixParts] = line.split(':');
    const suffix = suffixParts.join(':');

    switch (prefix) {
      case 'SF': {
        let sourceFilePath = suffix;

        if (config.prependSourceFiles) {
          const fullFilePathName = path.normalize(
            path.join(sourceDir, config.prependPathFix, sourceFilePath)
          );

          const rootRelPathName = path.relative(
            process.cwd(),
            fullFilePathName
          );

          sourceFilePath = './' + rootRelPathName;
        }

        currentCoverageFile = lcov.addCoverageFile(sourceFilePath);
        break;
      }

      case 'DA':
        currentCoverageFile.parseDA(suffix);
        break;

      case 'BRDA':
        currentCoverageFile.parseBRDA(suffix);
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
