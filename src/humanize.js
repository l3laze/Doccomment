'use strict'

/*
 * Based on https://stackoverflow.com/a/14919494/7665043
 */
function humanize (bytes) {
  const threshold = 1024
  const units = ['kB','MB','GB','TB','PB','EB','ZB','YB']

  var u = -1
  do {
    bytes /= threshold
    ++u
  } while(Math.abs(bytes) >= threshold && u < units.length - 1)
  return bytes.toFixed(1) + ' ' + units[ u ]
}

module.exports = {
  humanize
}