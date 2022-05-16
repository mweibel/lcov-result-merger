#!/usr/bin/env node

const vfs = require('vinyl-fs')
const through = require('through2')
const fs = require('fs')
const lcovResultMerger = require('../index')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const args = yargs(hideBin(process.argv))
  .command('* <pattern> [outFile] [options]', false, (cmd) => {
    cmd
      .positional('pattern', {
        required: true,
        type: 'string',
        description: 'A glob patterns matching one or more lcov files to be merged'
      })
      .positional('outFile', {
        type: 'string',
        description: 'A file to write the merged lcov to'
      })
      .options({
        'prefix-source-files': {
          type: 'boolean',
          default: false,
          description: 'Modify source file paths to be relative to the working directory that the merge operation was run in'
        }
      })
  })
  .argv

vfs.src(args.pattern)
  .pipe(lcovResultMerger(args))
  .pipe(through.obj((file) => {
    if (args.outFile) {
      fs.writeFileSync(args.outFile, file.contents)
    } else {
      process.stdout.write(file.contents)
    }
  }))
