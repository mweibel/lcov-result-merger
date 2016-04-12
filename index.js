/**
 * LCOV result merger
 *
 * @author Michael Weibel <michael.weibel@gmail.com>
 * @copyright 2013-2016 Michael Weibel
 * @license MIT
 */

var through = require('through2')
var File = require('vinyl')

/**
 * Represents a DA record
 *
 * @param {number} lineNumber
 * @param {number} hits
 *
 * @constructor
 */
function DA (lineNumber, hits) {
  this.lineNumber = lineNumber
  this.hits = hits
}

/**
 * Generates a DA string
 *
 * @returns {string}
 */
DA.prototype.toString = function () {
  return 'DA:' + this.lineNumber + ',' + this.hits + '\n'
}

/**
 * Represents a BRDA record
 *
 * @param {number} lineNumber
 * @param {number} blockNumber
 * @param {number} branchNumber
 * @param {number} hits
 *
 * @constructor
 */
function BRDA (lineNumber, blockNumber, branchNumber, hits) {
  this.lineNumber = lineNumber
  this.blockNumber = blockNumber
  this.branchNumber = branchNumber
  this.hits = hits
}

/**
 * Generates a BRDA string
 *
 * @returns {string}
 */
BRDA.prototype.toString = function () {
  var str = 'BRDA:'
  str += [this.lineNumber, this.blockNumber, this.branchNumber, this.hits].join(',')
  str += '\n'

  return str
}

/**
 * Represents a coverage file and it's DA/BRDA records
 *
 * @param {string} filename
 *
 * @constructor
 */
function CoverageFile (filename) {
  this.filename = filename
  this.DARecords = []
  this.BRDARecords = []
}

/**
 * Generates a coverage report for a file.
 *
 * @returns {string}
 */
CoverageFile.prototype.toString = function () {
  var header = 'SF:' + this.filename + '\n'
  var footer = 'end_of_record\n'

  var body = this.DARecords.map(function (daRecord) {
    return daRecord.toString()
  }).join('')

  body += this.BRDARecords.map(function (brdaRecord) {
    return brdaRecord.toString()
  }).join('')

  return header + body + footer
}

/**
 * Find an existing DA record
 *
 * @param {DA[]}     source
 * @param {number} lineNumber
 *
 * @returns {DA|null}
 */
function findDA (source, lineNumber) {
  for (var i = 0; i < source.length; i++) {
    var da = source[i]
    if (da.lineNumber === lineNumber) {
      return da
    }
  }
  return null
}

/**
 * Find an existing BRDA record
 *
 * @param {BRDA[]}   source
 * @param {number} blockNumber
 * @param {number} branchNumber
 * @param {number} lineNumber
 *
 * @returns {BRDA|null}
 */
function findBRDA (source, blockNumber, branchNumber, lineNumber) {
  for (var i = 0; i < source.length; i++) {
    var brda = source[i]
    if (brda.blockNumber === blockNumber &&
      brda.branchNumber === branchNumber &&
      brda.lineNumber === lineNumber) {
      return brda
    }
  }
  return null
}

/**
 * Find an existing coverage file
 *
 * @param {CoverageFile[]} source
 * @param {string}         filename
 *
 * @returns {CoverageFile|null}
 */
function findCoverageFile (source, filename) {
  for (var i = 0; i < source.length; i++) {
    var file = source[i]
    if (file.filename === filename) {
      return file
    }
  }
  return null
}

/**
 * Returns appropriate number of hits based on the string value of hits.
 *
 * @param {string} hits
 *
 * @returns {number}
 */
function numericHits (hits) {
  if (hits === '-') {
    return 0
  }
  return parseInt(hits, 10)
}

/**
 * Merges BRDA hits.
 *
 * @param {string} existingBRDAHits
 * @param {string} newBRDAHits
 *
 * @returns {number|string}
 */
function mergedBRDAHits (existingBRDAHits, newBRDAHits) {
  // If we've never executed the branch code path in an existing coverage
  // record and we've never executed it here either, then keep it as '-'
  // (eg, never executed). If either of them is a number, then
  // use the number value.
  if (existingBRDAHits !== '-' || newBRDAHits !== '-') {
    return numericHits(existingBRDAHits) + numericHits(newBRDAHits)
  }

  return '-'
}

/**
 * Splits the second part of the prefix into an array. The array
 * is a list of strings which represent numbers.
 *
 * @param {string[]} prefixSplit
 *
 * @returns {string[]}
 */
function splitNumbers (prefixSplit) {
  return prefixSplit[1].split(',')
}

/**
 * Parses a SF section
 *
 * @param {CoverageFile[]} lcov
 * @param {string[]}       prefixSplit
 *
 * @returns {CoverageFile|null}
 */
function parseSF (lcov, prefixSplit) {
  // If the filepath contains a ':', we want to preserve it.
  prefixSplit.shift()
  var currentFileName = prefixSplit.join(':')
  var currentCoverageFile = findCoverageFile(lcov, currentFileName)
  if (currentCoverageFile) {
    return currentCoverageFile
  }
  currentCoverageFile = new CoverageFile(currentFileName)
  lcov.push(currentCoverageFile)

  return currentCoverageFile
}

/**
 * Parses a DA section
 *
 * @param {CoverageFile} currentCoverageFile
 * @param {string[]}     prefixSplit
 */
function parseDA (currentCoverageFile, prefixSplit) {
  var numberSplit = splitNumbers(prefixSplit)
  var lineNumber = parseInt(numberSplit[0], 10)
  var hits = parseInt(numberSplit[1], 10)

  var existingDA = findDA(currentCoverageFile.DARecords, lineNumber)
  if (existingDA) {
    existingDA.hits += hits
    return
  }

  currentCoverageFile.DARecords.push(new DA(lineNumber, hits))
}

/**
 * Parses a BRDA section
 *
 * @param {CoverageFile} currentCoverageFile
 * @param {string[]}     prefixSplit
 */
function parseBRDA (currentCoverageFile, prefixSplit) {
  var numberSplit = splitNumbers(prefixSplit)
  var lineNumber = parseInt(numberSplit[0], 10)
  var blockNumber = parseInt(numberSplit[1], 10)
  var branchNumber = parseInt(numberSplit[2], 10)

  var existingBRDA = findBRDA(currentCoverageFile.BRDARecords,
    blockNumber, branchNumber, lineNumber)

  // Special case, hits might be a '-'. This means that the code block
  // where the branch was contained was never executed at all (as opposed
  // to the code being executed, but the branch not being taken). Keep
  // it as a string and let mergedBRDAHits work it out.
  var hits = numberSplit[3]

  if (existingBRDA) {
    existingBRDA.hits = mergedBRDAHits(existingBRDA.hits, hits)
    return
  }

  currentCoverageFile.BRDARecords.push(new BRDA(lineNumber, blockNumber, branchNumber, hits))
}

/**
 * Process a lcov input file into the representing Objects
 *
 * @param {string}         data
 * @param {CoverageFile[]} lcov
 *
 * @returns {CoverageFile[]}
 */
function processFile (data, lcov) {
  var lines = data.split('\n')
  var currentCoverageFile = null

  for (var i = 0, l = lines.length; i < l; i++) {
    var line = lines[i]
    if (line === 'end_of_record' || line === '') {
      currentCoverageFile = null
      continue
    }

    var prefixSplit = line.split(':')
    var prefix = prefixSplit[0]

    switch (prefix) {
      case 'SF':
        currentCoverageFile = parseSF(lcov, prefixSplit)
        break
      case 'DA':
        parseDA(currentCoverageFile, prefixSplit)
        break
      case 'BRDA':
        parseBRDA(currentCoverageFile, prefixSplit)
        break
      default:
        // do nothing with not implemented prefixes
    }
  }
  return lcov
}

/**
 * Creates LCOV records for given list of files.
 *
 * @param {CoverageFile[]} coverageFiles
 *
 * @returns {string}
 */
function createRecords (coverageFiles) {
  return coverageFiles.map(function (coverageFile) {
    return coverageFile.toString()
  }).join('')
}

module.exports = function () {
  var coverageFiles = []
  return through.obj(function process (file, encoding, callback) {
    if (file.isNull()) {
      callback()
      return
    }
    if (file.isStream()) {
      throw new Error('Streaming not supported')
    }
    coverageFiles = processFile(file.contents.toString(), coverageFiles)
    callback()
  }, function flush () {
    var file = new File({
      path: 'lcov.info',
      contents: new Buffer(createRecords(coverageFiles))
    })
    this.push(file)
    this.emit('end')
  })
}
