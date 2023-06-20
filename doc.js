'use strict'

function defaultRenderer (data, errors) {
  const out = document.getElementById('ta_output')
  out.value = JSON.stringify(data, null, 2)
  errors.length > 0 ? out.value += '\n' + errors.join('\n') : ''

  updateLines(out.id)
  out.scrollTop = out.scrollHeight
  updateScroll(out.id, 'lines_' + out.id)
}

async function parse (options = {}) {
  // Built with https://regexr.com/
  const re = /@(?<rawtag>raw) +?(?<rawdata>[^\n]+(?!@end))|@(?<tag>[\w]+)(?: +)?(?<data>[^\n]+)?/g

  const data = document.getElementById('ta_input').value

  const errors = []
  const root = []

  let found, line
  let obj = {}

  if (typeof options.tags === 'undefined') {
    options.tags = 'root|raw|section|list|item|table|thead|image|link|trow|text|end|separator|empty'.split('|')
  }
  
  if (typeof options.renderer === 'undefined') {
    options.renderer = defaultRenderer
  }

  /*
  for (line of data) {
    if ((found = re.exec(line)) !== null) {
      if (typeof found.groups.tag !== 'undefined') {
        if (options.tags.includes(found.groups.tag.trim())) {

      }
    }
  }
  */

  while ((found = re.exec(data)) !== null) {
    obj = {}

    obj.tag = (typeof found.groups.tag !== 'undefined'
      ? found.groups.tag.trim()
      : found.groups.rawtag.trim())

    if (!options.tags.includes(obj.tag.trim())) {
      line = data.slice(0, data.indexOf(found[0].trim()))
        .split('\n').length
      errors.push(`Warning from line ${line}: Unknown tag '${obj.tag}' in "${found[0].trim()}".`)
    } else {
      obj = {}

      obj.tag = (typeof found.groups.tag !== 'undefined'
        ? found.groups.tag.trim()
        : found.groups.rawtag.trim())

      if (typeof found.groups.data !== 'undefined') {
        obj.data = found.groups.data.trim()
      }

      if (typeof found.groups.rawdata !== 'undefined') {
        obj.data = found.groups.rawdata
      }

      if (typeof found.groups.data === 'undefined' &&
        typeof found.groups.rawdata === 'undefined') {
          obj.data = ''
      }

      root.push(obj)
    }
  }

  options.renderer(root, errors)
}

function resizeTA () {
  const tarray = document.querySelectorAll('textarea')

  tarray.forEach((t) => {
    const r = Math.floor(document.body.offsetHeight / parseInt(window.getComputedStyle(t).fontSize) / 2.8)
    t.rows = r
  })
}

function updateLines (tid) {
  const t = document.getElementById(tid)
  const l = document.getElementById('lines_' + tid)
  const textLength = t.value.split('\n').length
  const currentLength = l.value.split('\n').length

  l.value = ''

  for (let x = 1; x <= textLength; x++) {
    if (l.value !== '') {
      l.value += '\n'
    }

    l.value += x
  }
}

function updateScroll (from, to) {
  const f = document.getElementById(from)
  const t = document.getElementById(to)

  t.scrollTop = f.scrollTop
  t.scrollLeft = f.scrollLeft
}

document.addEventListener('DOMContentLoaded', function () {
  const ta = document.querySelectorAll('.editor')

  for (let t of ta) {
    t.addEventListener('change', () => {
      parse()
      updateLines(t.id)
    })

    t.addEventListener('input', () => {
      parse()
      updateLines(t.id)
    })

    t.addEventListener('scroll', (event) => {
      updateScroll(t.id, 'lines_' + t.id)
    })

    updateLines(t.id)
    t.scrollTop = t.scrollHeight
    updateScroll(t.id, 'lines_' + t.id)
  }
})

window.addEventListener('resize', resizeTA())
