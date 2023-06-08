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

  toString() {
    const { lineNumber, blockNumber, branchNumber, hits } = this;
    return `BRDA:${lineNumber},${blockNumber},${branchNumber},${hits}\n`;
  }
};
