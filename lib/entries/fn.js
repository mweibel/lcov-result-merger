/**
 * Represents an "FN" entry, which records the line number where a
 * named function is declared.
 */
module.exports = class FN {
  /**
   * @param {number} lineNumber
   * @param {string} functionName
   */
  constructor(lineNumber, functionName) {
    this.lineNumber = lineNumber;
    this.functionName = functionName;
  }

  /**
   * A string representation of the FN entry.
   *
   * @returns {string}
   */
  toString() {
    return `FN:${this.lineNumber},${this.functionName}\n`;
  }

  /**
   * Parses the contents on the right side of the colon for `FN:y,name`.
   * Function names may legitimately contain commas, so we only split on
   * the first one.
   *
   * @param {string} input
   * @returns {[lineNumber: number, functionName: string]}
   */
  static parseString(input) {
    const commaIndex = input.indexOf(',');
    return [
      parseInt(input.slice(0, commaIndex), 10),
      input.slice(commaIndex + 1),
    ];
  }
};
