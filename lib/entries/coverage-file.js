const DA = require('./da');
const BRDA = require('./brda');

/**
 * Represents a coverage file, and it's DA/BRDA records.
 */
module.exports = class CoverageFile {
  /**
   * @param {string} filename
   */
  constructor(filename) {
    this.filename = filename;
    this.DARecords = [];
    this.BRDARecords = [];
  }

  /**
   * Finds and returns an existing DA entry via its line number.
   *
   * @param {number} lineNumber
   * @returns {DA|undefined}
   */
  findDA(lineNumber) {
    return this.DARecords.find((record) => record.lineNumber === lineNumber);
  }

  /**
   * Creates a new DA record, or adds the hit count to an existing
   * record if available.
   *
   * @param {number} lineNumber
   * @param {number} hits
   */
  addDA(lineNumber, hits) {
    const existingRecord = this.findDA(lineNumber);

    if (existingRecord) {
      existingRecord.addHits(hits);
      return;
    }

    this.DARecords.push(new DA(lineNumber, hits));
  }

  /**
   * Parses the contents on the right side of the colon for a string with
   * the format `DA:y,z`, and adds the resulting DA instance to this
   * CoverageFile.
   *
   * @param {string} value
   */
  parseDA(value) {
    this.addDA(...DA.parseString(value));
  }

  /**
   * Finds and returns an existing BRDA entry.
   *
   * @param {number} lineNumber
   * @param {number} blockNumber
   * @param {number} branchNumber
   *
   * @returns {BRDA|undefined}
   */
  findBRDA(lineNumber, blockNumber, branchNumber) {
    return this.BRDARecords.find(
      (record) =>
        record.lineNumber === lineNumber &&
        record.blockNumber === blockNumber &&
        record.branchNumber === branchNumber
    );
  }

  /**
   * Creates a new BRDA record, or adds the hit count to an existing
   * record if available.
   *
   * @param {number} lineNumber
   * @param {number} blockNumber
   * @param {number} branchNumber
   * @param {number|"-"} hits
   */
  addBRDA(lineNumber, blockNumber, branchNumber, hits) {
    const existingRecord = this.findBRDA(lineNumber, blockNumber, branchNumber);

    if (existingRecord) {
      existingRecord.addHits(hits);
      return;
    }

    this.BRDARecords.push(
      new BRDA(lineNumber, blockNumber, branchNumber, hits)
    );
  }

  /**
   * Parses the contents on the right side of the colon for a string with
   * the format `BRDA:w,x,y,z`, and adds the resulting BRDA instance to
   * this CoverageFile.
   *
   * @param {string} value
   */
  parseBRDA(value) {
    this.addBRDA(...BRDA.parseString(value));
  }

  /**
   * A string representation of the CoverageFile, beginning with an `SF:`
   * line, and ending with `end_of_record`.
   *
   * @returns {string}
   */
  toString() {
    return (
      `SF:${this.filename}\n` +
      this.DARecords.map((record) => record.toString()).join('') +
      this.BRDARecords.map((record) => record.toString()).join('') +
      'end_of_record\n'
    );
  }
};
