/* eslint-env mocha */

const chai = require('chai');
chai.should();

const CoverageFile = require('../../lib/CoverageFile');

describe('Unit | CoverageFile', function () {
  it('should be constructable with the new operator', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.should.be.instanceOf(CoverageFile);
    instance.should.have.property('filename', 'test-lcov.info');
    instance.should.have.property('BRDARecords').eql([]);
    instance.should.have.property('DARecords').eql([]);
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

  it('should output a valid string representation of its content', async function () {
    const instance = new CoverageFile('test-lcov.info');

    instance.addBRDA(10, 20, 30, 40);
    instance.addDA(50, 60);

    instance
      .toString()
      .should.equal(
        'SF:test-lcov.info\n' +
          'DA:50,60\n' +
          'BRDA:10,20,30,40\n' +
          'end_of_record\n'
      );
  });
});
