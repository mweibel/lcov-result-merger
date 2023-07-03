const { dirname, join } = require('node:path');
const { mkdtemp, readFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const execa = require('execa');
const { rimraf } = require('rimraf');

/**
 * Run the lcov-result-merger command in a child process. If no glob pattern
 * is provided, the "basic" test fixtures are targeted.
 *
 * @param {string[]} [commands]
 * @param {string} [pattern]
 *
 * @returns {Promise<string>}
 */
async function runCli(commands, pattern) {
  const executable = join(__dirname, '../../bin/lcov-result-merger.js');
  const sourceGlob =
    pattern || `"${join(__dirname, '..', 'fixtures/basic/*/lcov.info')}"`;
  const args = [executable, sourceGlob, ...(commands || [])];

  return (await execa('node', args)).stdout.trim();
}

/**
 * Read the contents from the relevant "expected" fixture file.
 *
 * @param {'basic'|'prepended'|'prepended-path-fix'} type
 *
 * @returns {Promise<string>}
 */
async function getExpected(type) {
  const filePath = join(__dirname, '..', 'expected', type, 'lcov.info');
  return (await readFile(filePath, 'utf-8')).toString().trim();
}

/**
 * Returns the contents of the provided file as UTF-8 encoded text.
 *
 * @param {string} filePath
 *
 * @return {Promise<string>}
 */
async function getActual(filePath) {
  return (await readFile(filePath, 'utf-8')).toString().trim();
}

/**
 * Create a temporary directory to output lcov content into, and
 * return a full string path to the lcov file that will be written.
 *
 * @returns {Promise<string>}
 */
async function getTempLcovFilePath() {
  const filePath = await mkdtemp(join(tmpdir(), 'lcov-result-merger-'));
  return join(filePath, 'lcov.info');
}

/**
 * Empties the directory that the given file is in.
 *
 * @param {string} filePath
 *
 * @returns {Promise<boolean>}
 */
async function cleanFileDirectory(filePath) {
  return rimraf(dirname(filePath));
}

module.exports = {
  runCli,
  getExpected,
  getActual,
  getTempLcovFilePath,
  cleanFileDirectory,
};
