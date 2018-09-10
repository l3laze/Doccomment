'use strict'

const fs = require('fs')

async function readFileAsync (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      /* istanbul ignore next */
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

async function writeFileAsync (filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, (err) => {
      /* istanbul ignore next */
      if (err) {
        return reject(err)
      }
      return resolve()
    })
  })
}

/* istanbul ignore next */
async function unlinkAsync (filePath) {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      /* istanbul ignore next */
      return reject(err)
    })
    return resolve()
  })
}

/* istanbul ignore next */
async function readdirAsync (filePath) {
  return new Promise((resolve, reject) => {
    fs.readdir(filePath, (err, data) => {
      /* istanbul ignore next */
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

/* istanbul ignore next */
async function accessAsync (filePath) {
  return new Promise((resolve, reject) => {
    fs.access(filePath, (err, data) => {
      /* istanbul ignore next */
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

/* istanbul ignore next */
async function lstatAsync (filePath) {
  return new Promise((resolve, reject) => {
    fs.lstat(filePath, (err, data) => {
      /* istanbul ignore next */
      if (err) {
        return reject(err)
      }
      return resolve(data)
    })
  })
}

module.exports = {
  readFileAsync,
  writeFileAsync,
  readdirAsync,
  unlinkAsync,
  accessAsync,
  lstatAsync
}
