const chai = require('chai');
chai.should();

const FNDA = require('../../lib/entries/fnda');

describe('Unit | FNDA', function () {
  it('should be constructable with the new operator', async function () {
    const instance = new FNDA(20, 'myFunction');

    instance.should.be.instanceOf(FNDA);
    instance.should.have.property('hits', 20);
    instance.should.have.property('functionName', 'myFunction');
  });

  it('should be able to parse a string into meaningful values', async function () {
    FNDA.parseString('3,(anonymous_0)').should.eql([3, '(anonymous_0)']);
  });

  it('should preserve commas inside the function name', async function () {
    FNDA.parseString('5,foo,bar').should.eql([5, 'foo,bar']);
  });

  it('should preserve colons inside the function name', async function () {
    FNDA.parseString('5,Class::method').should.eql([5, 'Class::method']);
  });

  it('should output a valid string representation of its content', async function () {
    new FNDA(20, 'myFn').toString().should.equal('FNDA:20,myFn\n');
  });

  it('should accurately increment its hit count', async function () {
    const instance = new FNDA(2, 'myFn');
    instance.should.have.property('hits', 2);

    instance.addHits(3);
    instance.should.have.property('hits', 5);
  });
});
