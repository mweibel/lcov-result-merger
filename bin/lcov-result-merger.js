#!/usr/bin/env node
const fastGlob = require('fast-glob');
const { writeFile } = require('node:fs/promises');
const { mergeCoverageReportFiles } = require('../index');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

/**
 * @type {import("../lib/configuration").ConfigurationPojo}
 */
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

(async function () {
  const files = await fastGlob(args.pattern, {
    absolute: true,
    ignore: args.ignore,
  });

  const mergeResults = await mergeCoverageReportFiles(files, args);

  if (args.outFile) {
    await writeFile(args.outFile, mergeResults, 'utf-8');
  } else {
    process.stdout.write(mergeResults + '\n');
  }
})();
