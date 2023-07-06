/* eslint-env mocha */

const chai = require('chai');
chai.should();

const DA = require('../../lib/DA');

describe('Unit | DA', function () {
  it('should be constructable with the new operator', async function () {
    const instance = new DA(10, 20);

    instance.should.be.instanceOf(DA);
    instance.should.have.property('lineNumber', 10);
    instance.should.have.property('hits', 20);
  });

  it('should be able to parse a string into meaningful values', async function () {
    DA.parseString('1,2').should.eql([1, 2]);
  });

  it('should output a valid string representation of its content', async function () {
    new DA(10, 20).toString().should.equal('DA:10,20\n');
  });

  it('should accurately increment its hit count', async function () {
    const instance = new DA(1, 2);
    instance.should.have.property('hits', 2);

    instance.addHits(1);
    instance.should.have.property('hits', 3);
  });
});
