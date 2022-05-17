/* eslint-env mocha */

const fs = require('fs')
const os = require('os')
const path = require('path')
const chai = require('chai')
const execa = require('execa')
const rimraf = require('rimraf')

chai.should()

/**
 * Run the lcov-result-merger command in a child process.
 *
 * @param {string[]} [commands]
 * @returns {Promise<string>}
 */
async function runCli (commands) {
  const args = [
    './bin/lcov-result-merger.js',
    '"./test/fixtures/basic/*/lcov.info"'
  ].concat(commands || [])

  const { stdout } = await execa('node', args)
  return stdout.trim()
}

/**
 * Read the contents from the relevant "expected" fixture file.
 *
 * @param {'basic'|'prepended'} type
 * @returns {string}
 */
function getExpected (type) {
  return fs.readFileSync(`./test/expected/${type}/lcov.info`, 'utf-8').trim()
}

/**
 * Create a temporary directory to output lcov content into, and
 * return a full string path to the lcov file that will be written.
 *
 * @returns {string}
 */
function makeTmpFilePath () {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lcov-result-merger-'))
  return path.join(tmpDir, 'lcov.info')
}

/**
 * Clean up the temporary directory.
 *
 * @param {string} tmpFilePath
 */
function cleanTmpDirectory (tmpFilePath) {
  rimraf.sync(path.dirname(tmpFilePath))
}

describe('lcovResultMerger CLI', function () {
  it('should combine the given records into one', async function () {
    const actual = await runCli()
    actual.should.equal(getExpected('basic'))
  })

  it('should optionally prepend source file lines', async function () {
    const actual = await runCli(['--prepend-source-files'])
    actual.should.equal(getExpected('prepended'))
  })

  it('should combine to given records into one output file', async function () {
    const tmpFile = makeTmpFilePath()
    await runCli([tmpFile])
    const actual = fs.readFileSync(tmpFile, 'utf-8')

    actual.trim().should.equal(getExpected('basic'))
    cleanTmpDirectory(tmpFile)
  })

  it('should optionally prepend source file lines into one output file', async function () {
    const tmpFile = makeTmpFilePath()
    await runCli([tmpFile, '--prepend-source-files'])
    const actual = fs.readFileSync(tmpFile, 'utf-8')

    actual.trim().should.equal(getExpected('prepended'))
    cleanTmpDirectory(tmpFile)
  })
})
