const DA = require('./DA');
const BRDA = require('./BRDA');

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
   *
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

  toString() {
    return (
      `SF:${this.filename}\n` +
      this.DARecords.map((record) => record.toString()).join('') +
      this.BRDARecords.map((record) => record.toString()).join('') +
      'end_of_record\n'
    );
  }
};
