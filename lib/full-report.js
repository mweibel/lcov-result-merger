const CoverageFile = require('./entries/coverage-file');

/**
 * The FullReport class represents a collection of LCOV file contents that are
 * to be merged into one.
 */
module.exports = class FullReport {
  constructor() {
    this.coverageFiles = [];
  }

  /**
   * Returns the CoverageFile instance with the given `filename` if it exists.
   * Otherwise, returns undefined.
   *
   * @param {string} filename
   * @return {CoverageFile|undefined}
   */
  findCoverageFile(filename) {
    return this.coverageFiles.find((record) => record.filename === filename);
  }

  /**
   * Creates a new CoverageFile instance if one does not exist with the given
   * name. If an instance with `filename` already exists it will be returned.
   *
   * @param {string} filename
   * @returns {CoverageFile}
   */
  addCoverageFile(filename) {
    let coverageFile = this.findCoverageFile(filename);

    if (!coverageFile) {
      coverageFile = new CoverageFile(filename);
      this.coverageFiles.push(coverageFile);
    }

    return coverageFile;
  }

  /**
   * Returns the combined contents of all CoverageFile instances in valid
   * LCOV format.
   *
   * @returns {string}
   */
  toString() {
    return this.coverageFiles
      .sort((fileA, fileB) => fileA.filename.localeCompare(fileB.filename))
      .map((coverageFile) => coverageFile.toString())
      .join('');
  }
};
