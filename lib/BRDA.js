/**
 * Represents a BRDA entry, which records the hit count
 * of a logical branch in code.
 */
module.exports = class BRDA {
  /**
   * @param {number} lineNumber
   * @param {number} blockNumber
   * @param {number} branchNumber
   * @param {number|"-"} hits
   */
  constructor(lineNumber, blockNumber, branchNumber, hits) {
    this.lineNumber = lineNumber;
    this.blockNumber = blockNumber;
    this.branchNumber = branchNumber;
    this.hits = hits;
  }

  /**
   * Adds the value of the provided argument to the existing hit count. For
   * BRDA records, this also takes into account the special meaning of "-".
   *
   * @param {number|"-"} hits
   */
  addHits(hits) {
    // If we've never executed the branch code path in an existing coverage
    // record, and we've never executed it here either, then keep it as '-'
    // (eg, never executed). If either of them is a number, then
    // use the number value.
    if (this.hits === '-' && hits === '-') {
      return;
    }

    const oldHits = this.hits === '-' ? 0 : this.hits;
    const newHits = hits === '-' ? 0 : hits;

    this.hits = oldHits + newHits;
  }

  /**
   * A string representation of the BRDA entry.
   *
   * @returns {string}
   */
  toString() {
    const { lineNumber, blockNumber, branchNumber, hits } = this;
    return `BRDA:${lineNumber},${blockNumber},${branchNumber},${hits}\n`;
  }

  /**
   * Parses the contents on the right side of the colon for `BRDA:w,x,y,z`.
   *
   * @param {string} input
   * @returns {[lineNumber: number, blockNumber: number, branchNumber: number, hits: number|"-"]}
   */
  static parseString(input) {
    const [lineNumber, blockNumber, branchNumber, hits] = input.split(',');

    return [
      parseInt(lineNumber, 10),
      parseInt(blockNumber, 10),
      parseInt(branchNumber, 10),

      // Special case, hits might be a '-'. This means that the code block
      // where the branch was contained was never executed at all (as opposed
      // to the code being executed, but the branch not being taken).
      hits === '-' ? '-' : parseInt(hits, 10),
    ];
  }
};
