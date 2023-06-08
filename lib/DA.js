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
   * @param {number} hits
   */
  addHits(hits) {
    this.hits += hits;
  }

  toString() {
    return `DA:${this.lineNumber},${this.hits}\n`;
  }

  /**
   * @param {string} input
   *
   * @returns {[lineNumber: number, hits: number]}
   */
  static parseString(input) {
    const [lineNumber, hits] = input.split(',');
    return [parseInt(lineNumber, 10), parseInt(hits, 10)];
  }
};
