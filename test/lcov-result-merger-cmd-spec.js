/* eslint-env mocha */

const chai = require('chai');

const {
  runCli,
  getExpected,
  getActual,
  getTempLcovFilePath,
  cleanFileDirectory,
} = require('./helpers');

chai.should();

describe('lcovResultMerger CLI', function () {
  it('should combine the given records into one', async function () {
    const actual = await runCli();
    const expect = await getExpected('basic');

    actual.should.equal(expect);
  });

  it('should ignore paths with the --ignore option', async function () {
    const options = ['--ignore="**/extra.info"'];
    const pattern = '"./test/fixtures/ignore/*/*.info"';

    const actual = await runCli(options, pattern);
    const expect = await getExpected('basic');

    actual.should.equal(expect);
  });

  it('should optionally prepend source file lines', async function () {
    const options = ['--prepend-source-files', '--prepend-path-fix=""'];

    const actual = await runCli(options);
    const expect = await getExpected('prepended');

    actual.should.equal(expect);
  });

  it('should optionally prepend source file lines with corrected pathing', async function () {
    const options = ['--prepend-source-files'];
    const pattern = '"./test/fixtures/coverage-subfolder/*/coverage/lcov.info"';

    const actual = await runCli(options, pattern);
    const expect = await getExpected('prepended-path-fix');

    actual.should.equal(expect);
  });

  it('should combine to given records into one output file', async function () {
    const outfile = await getTempLcovFilePath();

    await runCli([outfile]);

    const actual = await getActual(outfile);
    const expect = await getExpected('basic');

    await cleanFileDirectory(outfile);

    actual.should.equal(expect);
  });

  it('should optionally prepend source file lines into one output file', async function () {
    const outfile = await getTempLcovFilePath();
    const options = [
      outfile,
      '--prepend-source-files',
      '--prepend-path-fix=""',
    ];

    await runCli(options);

    const actual = await getActual(outfile);
    const expect = await getExpected('prepended');

    await cleanFileDirectory(outfile);

    actual.should.equal(expect);
  });

  it('should optionally prepend source file lines into one output file with corrected pathing', async function () {
    const outfile = await getTempLcovFilePath();
    const options = [outfile, '--prepend-source-files'];
    const pattern = '"./test/fixtures/coverage-subfolder/*/coverage/lcov.info"';

    await runCli(options, pattern);

    const actual = await getActual(outfile);
    const expect = await getExpected('prepended-path-fix');

    await cleanFileDirectory(outfile);

    actual.should.equal(expect);
  });
});
