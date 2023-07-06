/**
 * Represents a "DA" entry, which records the hit count of
 * a line of code.
 */
module.exports = class DA {
  /**
   * @param {number} lineNumber
   * @param {number} hits
   */
  constructor(lineNumber, hits) {
    this.lineNumber = lineNumber;
    this.hits = hits;
  }

  /**
   * Adds the value of the provided argument to the existing hit count.
   *
   * @param {number} hits
   */
  addHits(hits) {
    this.hits += hits;
  }

  /**
   * A string representation of the DA entry.
   *
   * @returns {string}
   */
  toString() {
    return `DA:${this.lineNumber},${this.hits}\n`;
  }

  /**
   * Parses the contents on the right side of the colon for `DA:y,z`.
   *
   * @param {string} input
   * @returns {[lineNumber: number, hits: number]}
   */
  static parseString(input) {
    const [lineNumber, hits] = input.split(',');
    return [parseInt(lineNumber, 10), parseInt(hits, 10)];
  }
};
