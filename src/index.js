/**
 * @module Doccomment
 * @description Words
 */
'use strict'

const cli = require('cli')
const path = require('path')
const afs = require('./asyncLib.js')
const findPJ = require('./findPJ.js')

const existsSync = require('fs').existsSync
let pj

// ---- Extract Documentation Comments from source & store in a file...

const docStart = /\/\*\*/
const docEnd = /\*\//

let generator

function getLine (offset) {
  let stack = new Error().stack.split('\n')
  let line = stack[(offset || 1) + 1].split(':')

  return parseInt(line[line.length - 2], 10)
}

global.__defineGetter__('__LINE__', function () {
  return getLine(2)
})

/**
 * @module Doccomment
 * @async
 * @method extractFromFile
 * @description Extract doccomments as array of lines from file contents as a string.
 * @arg {String} data - The array of lines from a file to extract doccomments from.
 * returns {Array} - Lines that are doccomments from the source string.
 */
async function extractFromFile (data) {
  let inComment = false
  let docLines = []
  let docomments = []

  for (let line of data.split('\n')) {
    if (!inComment && docStart.test(line)) {
      inComment = true
    }

    if (inComment && line && line.trim() !== '') {
      docLines.push(line)
    }

    if (inComment && docEnd.test(line)) {
      inComment = false
      docomments.push(docLines)
      docLines = []
    }
  }

  return docomments
}

/**
 * @module Doccomment
 * @async
 * @method extractDocumentation
 * @description Extract doccomments from source files.
 * @arg {String} src - Source directory.
 * @arg {String} pattern - File pattern to search for; inclusive.
 * @arg {Boolean} recursive - Recursive if true, and will descend into child directories.
 * @returns {Object} - The parsed documentation tree.
 */
async function extractDocumentation (src, pattern, recursive) {
  // console.debug(`Checking if ${src} exists`)

  if (!existsSync(src)) {
    throw new Error(`${src} does not exist, or is not accessible with current permissions`)
  } else if (!(await afs.lstatAsync(src)).isDirectory()) {
    throw new Error(`${src} is not a directory`)
  }

  // console.debug(`Beginning extraction of ${src}`)

  const docs = {}
  const files = Array.from(await afs.readdirAsync(src)).filter((f) => pattern.test(f))
  let data
  let srcEntry

  // console.debug(`Found ${files.length} files matching pattern ${pattern} in ${src}`)

  for (let f of files) {
    srcEntry = path.join(src, f)

    if ((await afs.lstatAsync(srcEntry)).isFile()) {
      data = '' + await afs.readFileAsync(srcEntry)
      docs[ f ] = await extractFromFile(data)
      // console.debug(`Added ${src}/${f} to docomment tree`)
    } else if ((await afs.lstatAsync(srcEntry)).isDirectory() && recursive) {
      docs[ f ] = extractDocs(srcEntry, pattern)
    }
  }

  return docs
}

/**
 * @module Doccomment
 * @async
 * @method extractDocs
 * @description Extract doccomments from source files.
 * @arg {String} src - Source directory.
 * @arg {String} pattern - File pattern to search for; inclusive.
 * @arg {Boolean} recursive - Recursive if true, and will descend into child directories.
 * @returns {Object} - The parsed documentation tree.
 */
async function extractDocs (src, pattern, name, version) {
  // console.debug(`Extracting docs from ${src} with pattern ${pattern}`)
  try {
    const docs = {
      name: name, // Project Name; defaults to package.json#name
      version: version, // Documentation Version; defaults to package.json#version
      tree: null
    }

    docs.tree = await extractDocumentation(src, pattern)

    return docs
  } catch (err) {
    throw err
  }
}

// ---- Parse/convert the documentation comments to JSON & store in same file as they are loaded from...

/**
 * @module Doccomment
 * @async
 * @method createDoccomment
 * @description Create an object to hold a single doccomment.
 * @property {String} module - The module this is part of.
 * @property {String} function - The function this is documenting.
 * @property {String} description - Description of a module or function.
 * @property {String} async - Function is async.
 * @property {String} throws - An error type this throws, and it's description.
 * @property {String} returns - The value this returns.
 * @property {String} arguments - Array of argument objects like `{ default, description, name, type }`.
 * @property {String} properties - Object properties like `{ default, description, name, type }`.
 * @returns {Object} - The creates doccomment object.
 */
function createDocComment () {
  let obj = {
    module: null,
    function: null,
    description: null,
    async: null,
    throws: [],
    returns: [],
    arguments: [],
    properties: []
  }

  return obj
}

/**
 * @module Doccomment
 * @async
 * @method findLines
 * @description Filter an array of lines to only the lines that match a pattern.
 * @arg {Array} lines - The array of lines to search.
 * @arg {String} pattern - The pattern to search for.
 * @returns {Array} - The lines that match the pattern.
 */
function findLines (lines, pattern) {
  return lines.filter((line) => pattern.test(line))
}

/**
 * @module Doccomment
 * @async
 * @method getChunk
 * @description Extract the substring between `begin` and `end` from a string.
 * @arg {String} data - The base string to extract the chunk from.
 * @arg {String} begin - The beginning pattern to search for.
 * @arg {String} end - The ending pattern to search for.
 * @returns {String} - The extracted chunk.
 */
function getChunk (data, begin, end) {
  let start = data.search(begin)
  let stop = data.search(end)

  stop = stop === -1 ? data.length : stop

  return data.substring(start + begin.length, stop)
}

/**
 * @module Doccomment
 * @async
 * @method parseTypedEntry
 * @description Parse a doccomment that includes a type, e.g.: arg, property, throws, returns
 * @arg {String} entry - The line to parse.
 * @arg {Boolean} withName - Expect to find a name (for arg & param).
 * @throws {Error} - To propagates errors.
 * @returns {Object} - The parsed entry, like `{ description, type }` with arg and param optionally including `name` and `default`.
 */
function parseTypedEntry (entry, withName = false) {
  try {
    let t = getChunk(entry, '{', '}')
    //                       } name -
    let n = withName ? getChunk(entry, '} ', / (=|-)/) : null
    let f = / = /.test(entry) ? getChunk(entry, '= ', ' -') : null
    let d = getChunk(entry, ' - ', '\n')

    if (d === null) {
      throw new Error(`Failed to parse description of typed entry: ${entry}`)
    }

    let obj = {
      description: d
    }

    if (t.length) {
      obj.type = t
    }

    if (n !== null) {
      obj.name = n
    }

    if (f !== null) {
      obj.default = f
    }

    return obj
  } catch (err) {
    throw err
  }
}

/**
 * @module Doccomment
 * @async
 * @method parse
 * @description Parse a single line and create a doccomment Object using it's data.
 * @arg {String} comment - The line to parse.
 * @throws {Error} - To propagates errors.
 * @returns {Object} - An object representing the parsed doccomment.
 */
async function parse (comment) {
  try {
    let com = createDocComment()

    for (let line of comment) {
      if (/@module/.test(line)) {
        com.module = getChunk(line, '@module ', '\n')
      } else if (/@method/.test(line)) {
        com.function = getChunk(line, '@method ', '\n')
      } else if (/@description/.test(line)) {
        com.description = getChunk(line, '@description ', '\n')
      } else if (/@async/.test(line)) {
        com.async = true
      }
    }

    com.arguments = findLines(comment, /.*?@(arg|param)/).map((arg) => parseTypedEntry(arg, true))
    com.properties = findLines(comment, /.*?@property/).map((prop) => parseTypedEntry(prop, true))
    com.throws = findLines(comment, /.*?@throws/).map((thro) => parseTypedEntry(thro))
    com.returns = findLines(comment, /.*?@returns/).map((ret) => parseTypedEntry(ret))

    Object.keys(com).forEach((k) => {
      if ((/arguments|properties|throws|returns/.test(k) && JSON.stringify(com[ k ]) === '[]') || (/module|function|description|async/.test(k) && com[ k ] === null)) {
        delete com[ k ]
      }
    })

    return com
  } catch (err) {
    throw err
  }
}

/**
 * @module Doccomment
 * @async
 * @method compress
 * @description Prune a doccomment tree, removing empty branches and leaves (entries for methods, properties, modules). Also restructures by adding all methods and properties to the root instead of letting them branch out.
 * @arg {Doccomment} root - A doccomment to prune.
 * @returns {Object} - An object representing the doccomment after removing empty parts and restructuring.
 */
async function compress (root) {
  let compressed = {
    module: '',
    properties: [],
    methods: []
  }
  let tmp

  for (let branch of root) {
    if (branch.module && !branch.function) {
      // console.debug(`Found new module: ${branch.module}`)
      compressed = Object.assign(compressed, branch)
    } else if (branch.function) {
      // console.debug(`Found new function ${branch.function}` + (branch.module ? ` of module ${branch.module}` : ''))

      tmp = Object.assign({
        name: branch.function
      }, branch)

      delete tmp.function
      if (tmp.module) {
        delete tmp.module
      }

      compressed.methods.push(tmp)
    }
  }

  Object.keys(compressed).forEach((k) => {
    if ((/methods|properties/.test(k) && JSON.stringify(compressed[ k ]) === '[]') || (k === 'module' && compressed.module === '')) {
      delete compressed[ k ]
    }
  })

  return compressed
}

/**
 * @module Doccomment
 * @async
 * @method build
 * @description Convert intermediary version of parsed doccomments to a more useful version, recursively.
 * @arg {String} src - A tree of doccomments from extractDoccomments.
 * @throws {Error} - To propagate errors.
 * @returns {Object} - A tree of doccomments like `tree: { module: { branches... }}`
 */
async function build (src) {
  try {
    let parsed
    let built = {
      tree: {}
    }

    for (let root of Object.keys(src.tree)) {
      built.tree[ root ] = []

      for (let branch in src.tree[ root ]) {
        parsed = await parse(src.tree[ root ][ branch ])
        src.tree[ root ][ branch ] = parsed
      }

      src.tree[ root ] = await compress(src.tree[ root ])
    }
    // src.tree = built.tree

    return src
  } catch (err) {
    throw err
  }
}

/**
 * @module Doccomment
 * @async
 * @method parseDocs
 * @description Handle parsing, and if args say so building, documentation.
 * @arg {Object} options - CLI options as an object of `{ name: val }`.
 * @throws {Error} - To propagate errors.
 * @returns {Object} - The parsed docs based on options -- intermediary or human readable.
 */
async function parseDocs (options) {
  try {
    let srcPath = options.source.replace(/(\.\/)/, `${__dirname}/`)

    let documentation = await extractDocs(srcPath, new RegExp(options.pattern), options.name, options.version)

    if (options.intermediary) {
      await afs.writeFileAsync(path.join('doccomments.json'), JSON.stringify(documentation, null, 2))
    }

    // ---- Extract above, convert below...

    if (!options.extract) {
      documentation = await build(documentation)
    }

    if (options.intermediary) {
      await afs.writeFileAsync(path.join('doccomments.json'), JSON.stringify(documentation, null, 2))
    }

    return documentation
  } catch (err) {
    throw err
  }
}

// ---- Build documentation from intermediary JSON, using template functions to generate the data.

/**
 * @module Doccomment
 * @async
 * @method makeDocs
 * @description Uses the generator from options.generator, or the default markdown generator, to build human-readable docs; also writes them to disk.
 * @arg {Object} options - CLI options as an object of `{ name: val }`.
 * @throws {Error} - To propagate errors.
 */
async function makeDocs (options) {
  try {
    const parsed = await parseDocs(options)

    if (!options.parse) {
      // Generate human-readable docs...
      let isDefault = false

      if (!options.generator) {
        isDefault = true
        generator = require('./doccomment-json-to-markdown.js')
      } else {
        generator = require(options.generator)
      }

      // console.debug('Starting generator')
      await generator.generate(parsed, options)
    }
  } catch (err) {
    throw err
  }
}

/*
 * Parse CLI args, verify options, and run.
 */
(async () => {
  try {
    const options = cli.parse({
      name: ['n', 'Name of the project; defaults to name value from package.json.', 'string', undefined],
      version: ['v', 'Documentation version; defaults to version value from package.json.', 'string', undefined],
      source: ['s', 'The directory to search for source files to extract docs from.', 'path', path.join('src')],
      pattern: ['t', 'A pattern to select/ignore input files.', 'string', /\*\.js/],
      generator: ['g', 'Generator script for format', 'path', undefined],
      recursive: ['r', 'Recursively search for files in source directory.', 'boolean', false],
      out: ['o', 'The output file', 'path', path.join('api.md')],
      intermediary: ['i', 'Save intermediary output to file as JSON.', 'boolean', false],
      extract: ['e', 'Extract documentation comments, but do not parse them', 'boolean', false],
      parse: ['p', 'Parse to intermediary JSON, but do not build docs', 'boolean', false]
    })

    if (!options.source) {
      throw new Error('No source directory defined.')
    }

    let loc

    if (!options.name || !options.version) {
      try {
        loc = await findPJ(options.source)
        pj = JSON.parse('' + await afs.readFileAsync(loc))
      } catch (err) {
        if (err.message.indexOf('Could not find package.json.')) {
          console.error('Could not find package.json for project.')
          process.exit(1)
        }
      }

      if (!options.name) {
        options.name = pj.name
      }

      if (!options.version) {
        options.version = pj.version
      }
    }

    await makeDocs(options)
  } catch (err) {
    if (err.message.indexOf('No source directory defined') !== -1) {
      console.error(err.message)
    } else {
      console.error(err)
    }
    process.exit(1)
  }
})()
