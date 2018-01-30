# LCOV Result Merger
[![npm version](https://badge.fury.io/js/lcov-result-merger.svg)](https://badge.fury.io/js/lcov-result-merger)
[![Build Status](https://travis-ci.org/mweibel/lcov-result-merger.png)](https://travis-ci.org/mweibel/lcov-result-merger)
[![Coverage Status](https://coveralls.io/repos/github/mweibel/lcov-result-merger/badge.svg?branch=master)](https://coveralls.io/github/mweibel/lcov-result-merger?branch=master)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

When you have multiple test suites for the same application you still want to
have the code coverage across all testsuites.

This tool will handle this for you.

# Usage

`./node_modules/.bin/lcov-result-merger 'FILE_PATTERN' ['OUTPUT_FILE']`

# Examples

## Use stdout
1. Generate LCOV Code Coverage into different files, e.g. `build/coverage/coverage_X.log`
2. Run `./node_modules/.bin/lcov-result-merger 'build/coverage/coverage_*.log'`
3. Use the stdout to pipe it to e.g. [Coveralls](http://coveralls.io)
4. Done.

## Use merged output file
1. Generate LCOV Code Coverage into different files, e.g. `build/coverage/coverage_X.log`
2. Run `./node_modules/.bin/lcov-result-merger 'build/coverage/coverage_*.log' 'target/coverage/coverage_merged.log'`
3. Done. Enjoy your merged file.

