/**
 * LCOV result merger
 *
 * @author Michael Weibel <michael.weibel@gmail.com>
 * @copyright 2013-2023 Michael Weibel
 * @license MIT
 */

const { readFile, writeFile } = require('node:fs/promises');
const path = require('node:path');
const { Transform } = require('node:stream');
const Configuration = require('./lib/configuration');
const FullReport = require('./lib/full-report');

/**
 * Process a lcov input file into the representing Objects
 *
 * @param {string} sourceDir - The absolute path to the lcov file directory.
 * @param {Buffer} data
 * @param {FullReport} lcov
 * @param {Configuration} config
 *
 * @returns {FullReport}
 */
function processFile(sourceDir, data, lcov, config) {
  /** @type {import("./lib/entries/coverage-file")|null} */
  let currentCoverageFile = null;

  const lines = data.toString('utf-8').split(/\r?\n/);

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
 *
 *
 * @param {string[]} filePaths
 * @param {import("./lib/configuration").ConfigurationPojo} options
 *
 * @return {Promise<string>}
 */
async function mergeCoverageReportFiles(filePaths, options) {
  const config = new Configuration(options);
  const report = new FullReport();

  for (const filePath of filePaths) {
    const fileContent = await readFile(filePath, 'utf-8');
    processFile(path.dirname(filePath), fileContent, report, config);
  }

  const tmpFile = await config.getTempFilePath();

  await writeFile(tmpFile, Buffer.from(report.toString()), {
    encoding: 'utf-8',
    flag: 'w+',
  });

  return tmpFile;
}

/**
 *
 */
class WrappingTransform extends Transform {
  constructor(filePathsOrMergeOptions, mergeOptions) {
    super();

    this.filePaths = Array.isArray(filePathsOrMergeOptions)
      ? filePathsOrMergeOptions
      : [];

    this.mergeOptions = mergeOptions
      ? mergeOptions
      : Array.isArray(filePathsOrMergeOptions)
      ? {}
      : filePathsOrMergeOptions || {};
  }

  _transform(chunk, encoding, callback) {
    this.filePaths.push(chunk.toString());
    callback(null);
  }

  _flush(callback) {
    mergeCoverageReportFiles(this.filePaths, this.mergeOptions).then(
      (tempFile) => callback(null, tempFile),
      (error) => callback(error)
    );
  }
}

/**
 * @param {string[] | import("./lib/configuration").ConfigurationPojo} [filePathsOrOptions]
 * @param {import("./lib/configuration").ConfigurationPojo} [options]
 *
 * @return {module:stream.internal.Transform}
 */
function mergeCoverageReportFilesStream(filePathsOrOptions, options) {
  return new WrappingTransform(filePathsOrOptions, options);
}

module.exports = {
  mergeCoverageReportFiles,
  mergeCoverageReportFilesStream,
};
