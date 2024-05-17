/**
 * @typedef {Object} ConfigurationPojo
 *
 * @property {string}   pattern
 * @property {string}   [outFile]
 * @property {boolean}  [prependSourceFiles=false]
 * @property {boolean}  [prepend-source-files=false]
 * @property {string}   [prependPathFix]
 * @property {string}   [prepend-path-fix]
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
  }
};
