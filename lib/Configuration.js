const { join } = require('node:path');
const { tmpdir } = require('node:os');
const { mkdtemp } = require('node:fs');
const { promisify } = require('node:util');

const mkdtempAsync = promisify(mkdtemp);

/**
 * @typedef {Object} ConfigurationPojo
 *
 * @property {string}   pattern
 * @property {string}   [outFile]
 * @property {boolean}  [prependSourceFiles=false]
 * @property {boolean}  [prepend-source-files=false]
 * @property {string}   [prependPathFix]
 * @property {string}   [prepend-path-fix]
 * @property {boolean}  [legacyTempFile=false]
 * @property {boolean}  [legacy-temp-file=false]
 * @property {string[]} [ignore]
 */

module.exports = class Configuration {
  /**
   * @param {ConfigurationPojo} partial
   */
  constructor(partial = {}) {
    /**
     * A glob pattern matching one or more lcov files to be merged.
     * @type {string}
     */
    this.pattern = partial.pattern;

    /**
     * A file to write the merged lcov to.
     * @type {string|undefined}
     */
    this.outFile = partial.outFile;

    /**
     * File path globs that will be ignored.
     * @type {string[]}
     */
    this.ignore = Array.isArray(partial.ignore) ? partial.ignore : [];

    /**
     * Modify source file paths to be relative to the working directory that
     * the merge operation was run in.
     *
     * @type {boolean}
     */
    this.prependSourceFiles =
      typeof partial.prependSourceFiles === 'boolean'
        ? partial.prependSourceFiles
        : typeof partial['prepend-source-files'] === 'boolean'
        ? partial['prepend-source-files']
        : false;

    /**
     * If prepending source file paths, this is needed to describe the relative
     * path from the lcov directory to the project root.
     *
     * @type {string}
     */
    this.prependPathFix =
      typeof partial.prependPathFix === 'string'
        ? partial.prependPathFix
        : typeof partial['prepend-path-fix'] === 'string'
        ? partial['prepend-path-fix']
        : '..';

    /**
     * Prior to version 5, a lcov.info file containing the merged output was created in the
     * current working directory. The operating system's temporary directory is now used by default,
     * but if you relied on prior behavior then this flag will recreate it.
     *
     * @type {boolean}
     */
    this.legacyTempFile =
      typeof partial.legacyTempFile === 'boolean'
        ? partial.legacyTempFile
        : typeof partial['legacy-temp-file'] === 'boolean'
        ? partial['legacy-temp-file']
        : false;
  }

  /**
   * @param {string} [fileName="lcov.info"]
   * @param {string} [prefix="lcov-result-merger"]
   * @return {Promise<string>}
   */
  async getTempFilePath(
    fileName = 'lcov.info',
    prefix = 'lcov-result-merger-'
  ) {
    const tmpPath = this.legacyTempFile
      ? ''
      : await mkdtempAsync(join(tmpdir(), prefix));

    return join(tmpPath, fileName);
  }
};
