#!/usr/bin/env node
const fastGlob = require('fast-glob');
const { rename, readFile } = require('node:fs/promises');
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
        'legacy-temp-file': {
          type: 'boolean',
          default: false,
          description:
            'Prior to version 5, a lcov.info file containing the merged output was created in the ' +
            "current working directory. The operating system's temporary directory is now used by default, " +
            'but if you relied on prior behavior then this flag will recreate it.',
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

  const tempFilePath = await mergeCoverageReportFiles(files, args);

  if (args.outFile) {
    await rename(tempFilePath, args.outFile);
  } else {
    process.stdout.write(await readFile(tempFilePath, 'utf-8'));
  }
})();
