const DA = require('./da');
const BRDA = require('./brda');
const FN = require('./fn');
const FNDA = require('./fnda');

/**
 * Represents a coverage file, and it's DA/BRDA/FN/FNDA records.
 */
module.exports = class CoverageFile {
  /**
   * @param {string} filename
   */
  constructor(filename) {
    this.filename = filename;
    this.DARecords = [];
    this.BRDARecords = [];
    this.FNRecords = [];
    this.FNDARecords = [];
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
   * Finds and returns an existing FN entry by function name.
   *
   * @param {string} functionName
   * @returns {FN|undefined}
   */
  findFN(functionName) {
    return this.FNRecords.find(
      (record) => record.functionName === functionName
    );
  }

  /**
   * Creates a new FN record. If an entry for the same function name
   * already exists, the new line number replaces the old one (the most
   * recently merged definition wins, which matches lcov's behavior when
   * sources are kept in sync).
   *
   * @param {number} lineNumber
   * @param {string} functionName
   */
  addFN(lineNumber, functionName) {
    const existingRecord = this.findFN(functionName);

    if (existingRecord) {
      existingRecord.lineNumber = lineNumber;
      return;
    }

    this.FNRecords.push(new FN(lineNumber, functionName));
  }

  /**
   * Parses the contents on the right side of the colon for a string with
   * the format `FN:y,name`, and adds the resulting FN instance to this
   * CoverageFile.
   *
   * @param {string} value
   */
  parseFN(value) {
    this.addFN(...FN.parseString(value));
  }

  /**
   * Finds and returns an existing FNDA entry by function name.
   *
   * @param {string} functionName
   * @returns {FNDA|undefined}
   */
  findFNDA(functionName) {
    return this.FNDARecords.find(
      (record) => record.functionName === functionName
    );
  }

  /**
   * Creates a new FNDA record, or adds the hit count to an existing
   * record if available.
   *
   * @param {number} hits
   * @param {string} functionName
   */
  addFNDA(hits, functionName) {
    const existingRecord = this.findFNDA(functionName);

    if (existingRecord) {
      existingRecord.addHits(hits);
      return;
    }

    this.FNDARecords.push(new FNDA(hits, functionName));
  }

  /**
   * Parses the contents on the right side of the colon for a string with
   * the format `FNDA:y,name`, and adds the resulting FNDA instance to
   * this CoverageFile.
   *
   * @param {string} value
   */
  parseFNDA(value) {
    this.addFNDA(...FNDA.parseString(value));
  }

  /**
   * A string representation of the CoverageFile, beginning with a `TN:`
   * line, then `SF:`, then the records along with their summary lines
   * (FNF/FNH, LF/LH, BRF/BRH), and ending with `end_of_record`.
   *
   * Summary lines are computed from the records themselves so they stay
   * consistent with the merged data.
   *
   * @returns {string}
   */
  toString() {
    const functionsFound = this.FNRecords.length;
    const functionsHit = this.FNDARecords.filter(
      (record) => record.hits > 0
    ).length;

    const linesFound = this.DARecords.length;
    const linesHit = this.DARecords.filter((record) => record.hits > 0).length;

    const branchesFound = this.BRDARecords.length;
    const branchesHit = this.BRDARecords.filter(
      (record) => record.hits !== '-' && record.hits > 0
    ).length;

    return (
      'TN:\n' +
      `SF:${this.filename}\n` +
      this.FNRecords.map((record) => record.toString()).join('') +
      `FNF:${functionsFound}\n` +
      `FNH:${functionsHit}\n` +
      this.FNDARecords.map((record) => record.toString()).join('') +
      this.DARecords.map((record) => record.toString()).join('') +
      `LF:${linesFound}\n` +
      `LH:${linesHit}\n` +
      this.BRDARecords.map((record) => record.toString()).join('') +
      `BRF:${branchesFound}\n` +
      `BRH:${branchesHit}\n` +
      'end_of_record\n'
    );
  }
};
