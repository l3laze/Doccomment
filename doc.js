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
  const re = /.*?@(?<tag>[\w]+)(?: +\{(?<type>\w+)\})?(?:(?: +['"]?(?<name>[^'"\-=\n]+))?(?:['"]?(?: *\= +['"]?(?<default>\w+)['"]?)?(?: ?-?)+(?<content>[^'"\n]+))?)?\n?/g

  const data = document.getElementById('ta_input').value

  const errors = []
  const root = []

  let found, line
  let obj = {}

  if (typeof options.tags === 'undefined') {
    options.tags = 'root|section|list|item|table|thead|image|link|trow|text|end|separator'.split('|')
  }
  
  if (typeof options.renderer === 'undefined') {
    options.renderer = defaultRenderer
  }

  while ((found = re.exec(data)) !== null) {
    if (!options.tags.includes(found.groups.tag)) {
      line = data.slice(0, data.indexOf(found[0].trim()))
        .split('\n').length
      errors.push(`error on line ${line}: Unknown tag '${found.groups.tag}' in "${found[0].trim()}".`)
    } else {
      obj = {}

      if (typeof found.groups.tag !== 'undefined') {
        obj.tag = found.groups.tag.trim()

        if (typeof found.groups.type !== 'undefined') {
          obj.type = found.groups.type.trim()
        }

        if (typeof found.groups.name !== 'undefined') {
          obj.name = found.groups.name.trim()
        }

        if (typeof found.groups.default !== 'undefined') {
          obj.default = found.groups.default.trim()
        }

        if (typeof found.groups.content !== 'undefined') {
          obj.content = found.groups.content.trim()
        }
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
