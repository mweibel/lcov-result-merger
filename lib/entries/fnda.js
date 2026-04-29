/**
 * Represents an "FNDA" entry, which records the hit count of a named
 * function.
 */
module.exports = class FNDA {
  /**
   * @param {number} hits
   * @param {string} functionName
   */
  constructor(hits, functionName) {
    this.hits = hits;
    this.functionName = functionName;
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
   * A string representation of the FNDA entry.
   *
   * @returns {string}
   */
  toString() {
    return `FNDA:${this.hits},${this.functionName}\n`;
  }

  /**
   * Parses the contents on the right side of the colon for `FNDA:y,name`.
   * Function names may legitimately contain commas, so we only split on
   * the first one.
   *
   * @param {string} input
   * @returns {[hits: number, functionName: string]}
   */
  static parseString(input) {
    const commaIndex = input.indexOf(',');
    return [
      parseInt(input.slice(0, commaIndex), 10),
      input.slice(commaIndex + 1),
    ];
  }
};
