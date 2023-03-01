#!/usr/bin/env node
const fg = require('fast-glob');
const through = require('through2');
const fs = require('fs');
const lcovResultMerger = require('../index');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const args = yargs(hideBin(process.argv)).command(
  '* <pattern> [outFile] [options]',
  false,
  (cmd) => {
    cmd
      .positional('pattern', {
        required: true,
        type: 'string',
        description:
          'A glob patterns matching one or more lcov files to be merged',
      })
      .positional('outFile', {
        type: 'string',
        description: 'A file to write the merged lcov to',
      })
      .options({
        'prepend-source-files': {
          type: 'boolean',
          default: false,
          description:
            'Modify source file paths to be relative to the working directory that the merge operation was run in',
        },
        'prepend-path-fix': {
          type: 'string',
          default: '..',
          description:
            'If using --prepend-source-files, this is needed to describe the relative path from the lcov ' +
            'directory to the project root.',
        },
        ignore: {
          type: 'array',
          default: [],
          description: 'Pass globs to ignore file paths',
        },
      });
  }
).argv;

fg.stream(args.pattern, { absolute: true, ignore: args.ignore })
  .pipe(lcovResultMerger(args))
  .pipe(
    through.obj((filePath) => {
      const fileContentStr = fs.readFileSync(filePath, {
        encoding: 'utf-8',
        flag: 'r+',
      });
      fs.unlinkSync(filePath);

      if (args.outFile) {
        fs.writeFileSync(args.outFile, fileContentStr);
      } else {
        process.stdout.write(fileContentStr);
      }
    })
  );
