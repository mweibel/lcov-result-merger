/* eslint-env mocha */

const chai = require('chai');
chai.should();

const BRDA = require('../../lib/BRDA');

describe('Unit | BRDA', function () {
  it('should be constructable with the new operator', async function () {
    const instance = new BRDA(10, 20, 30, 40);

    instance.should.be.instanceOf(BRDA);
    instance.should.have.property('lineNumber', 10);
    instance.should.have.property('blockNumber', 20);
    instance.should.have.property('branchNumber', 30);
    instance.should.have.property('hits', 40);
  });

  it('should be able to parse a string into meaningful values', async function () {
    BRDA.parseString('1,2,3,4').should.eql([1, 2, 3, 4]);
    BRDA.parseString('5,6,7,-').should.eql([5, 6, 7, '-']);
  });

  it('should output a valid string representation of its content', async function () {
    new BRDA(10, 20, 30, 40).toString().should.equal('BRDA:10,20,30,40\n');
  });

  it('should accurately increment its hit count', async function () {
    let instance = new BRDA(1, 2, 3, '-');
    instance.should.have.property('hits', '-');

    instance.addHits('-');
    instance.should.have.property('hits', '-');

    instance.addHits(1);
    instance.should.have.property('hits', 1);

    instance = new BRDA(1, 2, 3, 4);
    instance.should.have.property('hits', 4);

    instance.addHits('-');
    instance.should.have.property('hits', 4);

    instance.addHits(1);
    instance.should.have.property('hits', 5);
  });
});
