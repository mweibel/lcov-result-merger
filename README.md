# LCOV Result Merger

When you have multiple test suites for the same application you still want to
have the code coverage across all testsuites.

This tool will handle this for you.

# Usage
1. Generate LCOV Code Coverage into different files, e.g. `coverage_X.log`
2. Run `./node_modules/bin/lcov-result-merger coverage_*.log`
3. Use the stdout to pipe it to e.g. [Coveralls](http://coveralls.io)
4. done.