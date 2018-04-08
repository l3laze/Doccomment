'use strict'

const cli = require('cli')
const path = require('path')
const afs = require('./asyncLib.js')

const existsSync = require('fs').existsSync
const fsConstants = {
  F_OK: require('fs').constants.F_OK,
  R_OK: require('fs').constants.R_OK,
  W_OK: require('fs').constants.W_OK,
  X_OK: require('fs').constants.X_OK,
  all: function all () {
    const entries = Object.keys(fsConstants).filter((k) => k !== 'all')
    let result = 0x0

    for (let e of entries) {
      result |= e
    }

    return result
  }
}
let pj

// ---- Extract Documentation Comments from source & store in a file...

const docStart = /\/\*\*/
const docEnd = /\*\//

let generator

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

async function extractDocumentation (src, pattern, recursive) {
  console.debug(`Checking if ${src} exists`)

  if (!existsSync(src, fsConstants.F_OK)) {
    throw new Error(`${src} does not exist, or is not accessible with current permissions`)
  } else if (!(await afs.lstatAsync(src)).isDirectory()) {
    throw new Error(`${src} is not a directory`)
  }

  console.debug(`Beginning extraction of ${src}`)

  const docs = {}
  const files = Array.from(await afs.readdirAsync(src)).filter((f) => pattern.test(f))
  let data
  let srcEntry

  console.debug(`Found ${files.length} files matching pattern ${pattern} in ${src}`)

  for (let f of files) {
    srcEntry = path.join(src, f)

    if ((await afs.lstatAsync(srcEntry)).isFile()) {
      data = '' + await afs.readFileAsync(srcEntry)
      docs[ f ] = await extractFromFile(data)
      console.debug(`Added ${src}/${f} to docomment tree`)
    } else if ((await afs.lstatAsync(srcEntry)).isDirectory() && recursive) {
      docs[ f ] = extractDocs(srcEntry, pattern)
    }
  }

  return docs
}

async function extractDocs (src, pattern, name, version) {
  console.debug(`Extracting docs from ${src} with pattern ${pattern}`)
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

function findLines (lines, pattern) {
  return lines.filter((line) => pattern.test(line))
}

function getChunk (data, begin, end) {
  let start = data.search(begin)
  let stop = data.search(end)

  stop = stop === -1 ? data.length : stop

  return data.substring(start + begin.length, stop)
}

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

async function compress (root) {
  let compressed = {
    module: '',
    properties: [],
    methods: []
  }
  let tmp

  for (let branch of root) {
    if (branch.module && !branch.function) {
      console.info(`Found new module: ${branch.module}`)
      compressed = Object.assign(compressed, branch)
    } else if (branch.function) {
      console.info(`Found new function ${branch.function}` + (branch.module ? ` of module ${branch.module}` : ''))

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

async function parseDocs (options) {
  try {
    let srcPath = options.source.replace(/(\.\/)/, `${__dirname}/`)

    let documentation = await extractDocs(srcPath, new RegExp(options.pattern), options.name, options.version)

    await afs.writeFileAsync(options.intermediary, JSON.stringify(documentation, null, 2))

    // ---- Extract above, convert below...

    if (!options.extract) {
      documentation = await build(documentation)

      await afs.writeFileAsync(options.intermediary, JSON.stringify(documentation, null, 2))

      return documentation
    }
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

// ---- Build documentation from intermediary JSON, using template functions to generate the data.

async function makeDocs (options) {
  try {
    const parsed = await parseDocs(options)

    if (!options.parse) {
      // Generate human-readable docs...
      if (options.format === 'md') {
        if (!options.generator) {
          generator = require('./doccomment-json-to-markdown.js')
        } else {
          generator = require(options.generator)
        }

        afs.writeFileAsync(path.join('./', 'API.md'), await generator.generate(parsed, options))
      }
    }
  } catch (err) {
    throw err
  }
}

(async () => {
  try {
    pj = JSON.parse('' + await afs.readFileAsync(path.join(__dirname, 'package.json')))

    const options = cli.parse({
      name: ['n', 'Name of the project; defaults to name value from package.json.', 'string', pj.name],
      version: ['v', 'Documentation version; defaults to version value from package.json.', 'string', pj.version],
      source: ['s', 'The directory to search for source files to extract docs from.', 'path', path.join('./', 'src')],
      pattern: ['p', 'A pattern to select/ignore input files.', 'string', /\*\.js/],
      format: ['f', 'Format of output', 'string', 'md'],
      generator: ['g', 'Generator script for format', 'path', undefined],
      recursive: ['r', 'Recursively search for files in source directory.', 'boolean', false],
      intermediary: ['i', 'Intermediary output file (JSON).', 'path', path.join('doccomments.json')],
      out: ['o', 'The output file', 'path', path.join('API.md')],
      extract: ['eo', 'Extract documentation comments, but do not parse them', 'boolean', false],
      parse: ['po', 'Parse to intermediary JSON, but do not build docs', 'boolean', false]
    })

    if (!options.source) {
      throw new Error('No source directory defined.')
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
