#!/usr/bin/env node

var vfs = require('vinyl-fs')
var through = require('through2')
var fs = require('fs')
var lcovResultMerger = require('../index')

if (process.argv.length < 3) {
  console.error('')
  console.error("Usage: node lcov-result-merger 'pattern'" +
    " ['output file']")
  console.error("EX: node lcov-result-merger 'target/**/lcov.out'" +
    " 'target/lcov-merged.out'")
  console.error('')
  process.exit(1)
}

var userArgs = process.argv.slice(2)

var firstConfigFlag = userArgs.find(function (value) {
  return typeof value === 'string' && value.substring(0, 2) === '--'
})
var firstFlagIndex = firstConfigFlag ? userArgs.indexOf(firstConfigFlag) : -1

var configFlags = firstFlagIndex > -1
  ? userArgs.slice(firstFlagIndex).reduce(function (acc, cur) {
    acc[cur.substring(2)] = true
    return acc
  }, {})
  : {}

var files = userArgs[0]
var outputFile = firstFlagIndex > 1 ? userArgs[1] : null

vfs.src(files)
  .pipe(lcovResultMerger(configFlags))
  .pipe(through.obj(function (file) {
    if (outputFile) {
      fs.writeFileSync(outputFile, file.contents)
    } else {
      process.stdout.write(file.contents)
    }
  }))
