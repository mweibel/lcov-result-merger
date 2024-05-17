/**
 * LCOV result merger
 *
 * @author Michael Weibel <michael.weibel@gmail.com>
 * @copyright 2013-2024 Michael Weibel
 * @license MIT
 */

const { readFile } = require('node:fs/promises');
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
  config.logger?.(`Read ${lines.length} lines of content`);

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

          config.logger?.(
            `Re-writing source file path, Before: "${sourceFilePath}"`
          );

          sourceFilePath = './' + rootRelPathName;

          config.logger?.(
            `Re-writing source file path, After:  "${sourceFilePath}"`
          );
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
        config.logger?.(
          `Ignoring unrecognized/unsupported entry (line #${i}): "${prefix}:${suffix}"`
        );
    }
  }

  return lcov;
}

/**
 * Merge together the LCOV contents of the provided files.
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
    config.logger?.(`Processing "${filePath}"`);
    processFile(path.dirname(filePath), fileContent, report, config);
  }

  return report.toString().trim();
}

/**
 * A Stream wrapper for the merge utility.
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
      (fullReport) => callback(null, fullReport.toString().trim()),
      (error) => callback(error)
    );
  }
}

/**
 * A variation of the `mergeCoverageReportFiles()` utility that will return a
 * stream instead of a promise.
 *
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
