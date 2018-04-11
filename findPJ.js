'use strict'

const path = require('path')
const afs = require('./asyncLib.js')

async function isDir (dir) {
  try {
    const res = await afs.lstatAsync(dir)
    if (res.isDirectory()) {
      return true
    }

    return false
  } catch (err) {
    throw err
  }
}

async function findPJ (dir) {
  try {
    if (!isDir(dir)) {
      throw new Error(`${dir} is not a directory.`)
    }

    const files = await afs.readdirAsync(dir)

    let res

    if (files.indexOf('package.json') !== -1) {
      res = path.join(dir, 'package.json')

      return res
    } else if (files.indexOf('.git') === -1) {
      res = await findPJ(path.join(dir, '..'))

      return res
    }

    throw new Error('Could not find package.json.')
  } catch (err) {
    throw err
  }
}

module.exports = findPJ
