const CoverageFile = require('./CoverageFile');

module.exports = class FullReport {
  constructor() {
    this.coverageFiles = [];
  }

  /**
   * @param {string} filename
   * @return {CoverageFile|undefined}
   */
  findCoverageFile(filename) {
    return this.coverageFiles.find((record) => record.filename === filename);
  }

  /**
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

  toString() {
    return this.coverageFiles
      .sort((fileA, fileB) => fileA.filename.localeCompare(fileB.filename))
      .map((coverageFile) => coverageFile.toString())
      .join('');
  }
};
