const chai = require('chai');
chai.should();

const FN = require('../../lib/entries/fn');

describe('Unit | FN', function () {
  it('should be constructable with the new operator', async function () {
    const instance = new FN(10, 'myFunction');

    instance.should.be.instanceOf(FN);
    instance.should.have.property('lineNumber', 10);
    instance.should.have.property('functionName', 'myFunction');
  });

  it('should be able to parse a string into meaningful values', async function () {
    FN.parseString('1,(anonymous_0)').should.eql([1, '(anonymous_0)']);
  });

  it('should preserve commas inside the function name', async function () {
    FN.parseString('5,foo,bar').should.eql([5, 'foo,bar']);
  });

  it('should preserve colons inside the function name', async function () {
    FN.parseString('5,Class::method').should.eql([5, 'Class::method']);
  });

  it('should output a valid string representation of its content', async function () {
    new FN(10, 'myFn').toString().should.equal('FN:10,myFn\n');
  });
});
