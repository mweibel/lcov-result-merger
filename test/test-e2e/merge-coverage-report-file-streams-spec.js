/* eslint-env mocha */

const fastGlob = require('fast-glob');
const chai = require('chai');
const { getActual, getExpected } = require('../helpers');
const { mergeCoverageReportFilesStream } = require('../../index.js');

chai.should();

async function testStream(pattern, filePathsOrOptions, options) {
  return new Promise((resolve) => {
    let tempFilePath;

    const stream = pattern
      ? fastGlob
          .stream(pattern)
          .pipe(mergeCoverageReportFilesStream(filePathsOrOptions, options))
      : mergeCoverageReportFilesStream(filePathsOrOptions, options);

    stream
      .on('data', (chunk) => {
        tempFilePath = chunk.toString();
      })
      .on('end', () => {
        resolve(tempFilePath);
      });
  });
}

describe('mergeCoverageReportFilesStream', function () {
  it('should combine the given records into one', async function () {
    const output = await testStream('./test/fixtures/basic/*/lcov.info');
    const actual = await getActual(output);
    const expect = await getExpected('basic');

    return actual.should.equal(expect);
  });

  it('should handle a record with : in the name', async function () {
    const output = await testStream('./test/fixtures/windows/lcov.info');
    const actual = await getActual(output);
    const expect = await getExpected('windows');

    return actual.should.equal(expect);
  });

  it('should optionally prepend source file lines', async function () {
    const pattern = './test/fixtures/basic/*/lcov.info';
    const options = { 'prepend-source-files': true, 'prepend-path-fix': '' };

    const output = await testStream(pattern, options);
    const actual = await getActual(output);
    const expect = await getExpected('prepended');

    return actual.should.equal(expect);
  });

  it('should optionally prepend source file lines with corrected pathing', async function () {
    const pattern = './test/fixtures/coverage-subfolder/*/coverage/lcov.info';
    const options = { 'prepend-source-files': true };

    const output = await testStream(pattern, options);
    const actual = await getActual(output);
    const expect = await getExpected('prepended-path-fix');

    return actual.should.equal(expect);
  });
});
