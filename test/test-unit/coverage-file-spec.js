/* eslint-env mocha */

const chai = require('chai');
chai.should();

const CoverageFile = require('../../lib/entries/coverage-file');

describe('Unit | CoverageFile', function () {
  it('should be constructable with the new operator', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.should.be.instanceOf(CoverageFile);
    instance.should.have.property('filename', 'test-lcov.info');
    instance.should.have.property('BRDARecords').eql([]);
    instance.should.have.property('DARecords').eql([]);
    instance.should.have.property('FNRecords').eql([]);
    instance.should.have.property('FNDARecords').eql([]);
  });

  it('should allow DA records to be added', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.DARecords.should.have.length(0);

    instance.addDA(10, 1);
    instance.DARecords.should.have.length(1);
    instance.DARecords[0].should.have.property('lineNumber', 10);
    instance.DARecords[0].should.have.property('hits', 1);

    instance.parseDA('20,2');
    instance.DARecords.should.have.length(2);
    instance.DARecords[1].should.have.property('lineNumber', 20);
    instance.DARecords[1].should.have.property('hits', 2);
  });

  it('should add hits to an existing DA record when one exists, instead of creating a duplicate', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.addDA(10, 1);
    instance.DARecords.should.have.length(1);
    instance.DARecords[0].should.have.property('lineNumber', 10);
    instance.DARecords[0].should.have.property('hits', 1);

    instance.addDA(10, 3);
    instance.DARecords.should.have.length(1);
    instance.DARecords[0].should.have.property('lineNumber', 10);
    instance.DARecords[0].should.have.property('hits', 4);
  });

  it('should allow BRDA records to be added', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.BRDARecords.should.have.length(0);

    instance.addBRDA(10, 20, 30, 40);
    instance.BRDARecords.should.have.length(1);
    instance.BRDARecords[0].should.have.property('lineNumber', 10);
    instance.BRDARecords[0].should.have.property('blockNumber', 20);
    instance.BRDARecords[0].should.have.property('branchNumber', 30);
    instance.BRDARecords[0].should.have.property('hits', 40);

    instance.parseBRDA('1,2,3,4');
    instance.BRDARecords.should.have.length(2);
    instance.BRDARecords[1].should.have.property('lineNumber', 1);
    instance.BRDARecords[1].should.have.property('blockNumber', 2);
    instance.BRDARecords[1].should.have.property('branchNumber', 3);
    instance.BRDARecords[1].should.have.property('hits', 4);
  });

  it('should add hits to an existing BRDA record when one exists, instead of creating a duplicate', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.addBRDA(10, 20, 30, 1);
    instance.BRDARecords.should.have.length(1);
    instance.BRDARecords[0].should.have.property('lineNumber', 10);
    instance.BRDARecords[0].should.have.property('blockNumber', 20);
    instance.BRDARecords[0].should.have.property('branchNumber', 30);
    instance.BRDARecords[0].should.have.property('hits', 1);

    instance.addBRDA(10, 20, 30, 3);
    instance.BRDARecords.should.have.length(1);
    instance.BRDARecords[0].should.have.property('lineNumber', 10);
    instance.BRDARecords[0].should.have.property('blockNumber', 20);
    instance.BRDARecords[0].should.have.property('branchNumber', 30);
    instance.BRDARecords[0].should.have.property('hits', 4);
  });

  it('should allow FN records to be added', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.FNRecords.should.have.length(0);

    instance.addFN(10, 'fn1');
    instance.FNRecords.should.have.length(1);
    instance.FNRecords[0].should.have.property('lineNumber', 10);
    instance.FNRecords[0].should.have.property('functionName', 'fn1');

    instance.parseFN('20,fn2');
    instance.FNRecords.should.have.length(2);
    instance.FNRecords[1].should.have.property('lineNumber', 20);
    instance.FNRecords[1].should.have.property('functionName', 'fn2');
  });

  it('should not duplicate an FN record for the same function name', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.addFN(10, 'fn1');
    instance.FNRecords.should.have.length(1);

    instance.addFN(15, 'fn1');
    instance.FNRecords.should.have.length(1);
    instance.FNRecords[0].should.have.property('lineNumber', 15);
  });

  it('should allow FNDA records to be added', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.FNDARecords.should.have.length(0);

    instance.addFNDA(2, 'fn1');
    instance.FNDARecords.should.have.length(1);
    instance.FNDARecords[0].should.have.property('hits', 2);
    instance.FNDARecords[0].should.have.property('functionName', 'fn1');

    instance.parseFNDA('5,fn2');
    instance.FNDARecords.should.have.length(2);
    instance.FNDARecords[1].should.have.property('hits', 5);
    instance.FNDARecords[1].should.have.property('functionName', 'fn2');
  });

  it('should add hits to an existing FNDA record when one exists, instead of creating a duplicate', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.addFNDA(2, 'fn1');
    instance.FNDARecords.should.have.length(1);
    instance.FNDARecords[0].should.have.property('hits', 2);

    instance.addFNDA(3, 'fn1');
    instance.FNDARecords.should.have.length(1);
    instance.FNDARecords[0].should.have.property('hits', 5);
  });

  it('should compute FNH correctly when some functions were never executed', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.addFN(5, 'fn1');
    instance.addFNDA(0, 'fn1');
    instance.addFN(7, 'fn2');
    instance.addFNDA(3, 'fn2');
    instance.addFN(9, 'fn3');
    instance.addFNDA(0, 'fn3');

    const output = instance.toString();
    output.should.contain('FNF:3\n');
    output.should.contain('FNH:1\n');
  });

  it('should compute LH correctly when some lines were never executed', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.addDA(1, 5);
    instance.addDA(2, 0);
    instance.addDA(3, 0);
    instance.addDA(4, 1);

    const output = instance.toString();
    output.should.contain('LF:4\n');
    output.should.contain('LH:2\n');
  });

  it('should compute BRH correctly, excluding "-" and zero-hit branches', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.addBRDA(1, 0, 0, '-');
    instance.addBRDA(1, 0, 1, '-');
    instance.addBRDA(2, 1, 0, 0);
    instance.addBRDA(3, 2, 0, 4);

    const output = instance.toString();
    output.should.contain('BRF:4\n');
    output.should.contain('BRH:1\n');
  });

  it('should output a valid empty record when no records were added', async function () {
    const instance = new CoverageFile('empty.scss');

    instance
      .toString()
      .should.equal(
        'TN:\n' +
          'SF:empty.scss\n' +
          'FNF:0\n' +
          'FNH:0\n' +
          'LF:0\n' +
          'LH:0\n' +
          'BRF:0\n' +
          'BRH:0\n' +
          'end_of_record\n'
      );
  });

  it('should output a valid string representation of its content', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.addFN(5, 'fn1');
    instance.addFNDA(2, 'fn1');
    instance.addBRDA(10, 20, 30, 40);
    instance.addBRDA(11, 20, 30, '-');
    instance.addDA(50, 60);
    instance.addDA(51, 0);

    instance
      .toString()
      .should.equal(
        'TN:\n' +
          'SF:test-lcov.info\n' +
          'FN:5,fn1\n' +
          'FNF:1\n' +
          'FNH:1\n' +
          'FNDA:2,fn1\n' +
          'DA:50,60\n' +
          'DA:51,0\n' +
          'LF:2\n' +
          'LH:1\n' +
          'BRDA:10,20,30,40\n' +
          'BRDA:11,20,30,-\n' +
          'BRF:2\n' +
          'BRH:1\n' +
          'end_of_record\n'
      );
  });
});
