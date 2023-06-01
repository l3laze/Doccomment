'use strict'

function initOptions (options) {
  if (typeof options.closed === 'undefined') {
    options.closed = true
  }

  if (typeof options.indent === 'undefined') {
    options.indent = 0
  }

  if (typeof options.indentChar === 'undefined') {
    options.indentChar = ' '
  }

  if (typeof options.separate === 'undefined') {
    options.separate = false
  }

  return options
}

function htmlTag (tag, content, options = {closed: true, separate: false, indent: 0, indentChar: ' '}) {
  options = initOptions(options)

  let result = `${options.indentChar.repeat(options.indent)}\
<${tag}>\
${options.separate ? '\n' + options.indentChar.repeat(options.indent) : ''}\
${content}` +
    (options.closed ?
      `${options.separate ? '\n' + options.indentChar.repeat(options.indent) : ''}\
</${tag}>`
    : '')

  return result
}

function closeTag (tag, options = {indent: 0, indentChar: ' ', separate: false}) {
  options = initOptions(options)

  const result = `${options.indentChar.repeat(options.indent)}</${tag}>${options.separate ? '\n' : ''}`

  return result
}

function selfTag (tag, options = {indent: 0, indentChar: ' ', separate: false}) {
  options = initOptions(options)

  return `${options.indentChar.repeat(options.indent)}\
<${tag}>\
${options.separate ? '\n' + options.indentChar.repeat(options.indent) : ''}`
}

function renderSecondaryTags (data) {
  const secondary = [ 'image', 'link', 'text' ]
  const re = /@(?<tag>[\w]+)(?: +)(?<data>[^\n<]+)(?<rest>[^\n]+)/g

  let temp, start = 0, link

  for (let x = 0; x < data.length; x++) {
    if (/\n$/.test(data[x]) &&
      (x + 1) <= data.length &&
      (/\<\/\w+/.test(data[x + 1]))) {
      data[x] = data[x].replace(/\n$/, '')
    }

    while ((temp = re.exec(data[x])) !== null) {
      start = data[x].indexOf('@' + temp.groups.tag) || 0

      switch(temp.groups.tag) {
        case 'link':
          link = temp.groups.data.split(' ').slice(1).join(' ').split('<')[0]

          if (link === '' || link.length === 0) {
            link = temp.groups.data.split(' ')[0]
          }

          data[x] = `${data[x].substring(0, start)}<a href="${temp.groups.data.split(' ')[0]}">${link}</a>${temp.groups.rest}`
        break

        case 'image':
          data[x] = `${data[x].substring(0, start)}<img src="${data[x].slice(start).split(' ')[1].indexOf('</') > -1 ? data[x].slice(start).split(' ')[1].replace('</', '"></') : data[x].slice(start).split(' ')[1] + '">'}${data[x].slice(start).split(' ').slice(2).join(' ')}`
        break

        case 'text':
          data[x] = `${data[x].substring(0, start)}${data[x].slice(start).split(' ')[1]}`
        break

        case 'empty':
          data[x] = '<br>'
        break
      }

      if (secondary.filter((s) => data[x].indexOf(s) > -1).length > 0 && re.test(data[x])) {
        continue
      }
    }
  } 

  return data
}

function renderToc (toc, options = {indent: 0}) {
  options = initOptions(options)

  let temp

  temp = toc.map((a) => {
    return `blahblah>@link ${a[1]} ${a[0]}</yadda`
  })

  temp = renderSecondaryTags(temp)

  temp = temp.join('\n').replace(/blahblah\>/g, '').replace(/\<\/yadda/g, '').split('\n')

  temp = temp.map((a, index) => htmlTag('li', a, {indent: options.indent + 6}))

  temp = htmlTag('ul', '\n' + temp.join('\n') + '\n' + ' '.repeat(options.indent + 4), {indent: options.indent + 4})

  temp = htmlTag('h1', 'Table of Contents', {indent: 4}) + '\n' + temp

  temp = htmlTag('section', '\n' + temp + '\n  ', {indent: 2}) + '\n'

  return temp
}

function htmlRenderer (data, errors) {
  const lout = document.getElementById('lines_ta_output')
  const hout = document.getElementById('ta_output')

  errors.length > 0 ? hout.value += '\n' + errors.join('\n') : ''

  let result = []
  let toc = []
  const stack = []

  let temp, htag, link, start, hasRoot = false

  errors = []

  data.forEach((e) => {
    switch (e.tag) {
      case 'root':
        hasRoot = true

        result.push(htmlTag('html',
          htmlTag('head',
            '\n' + htmlTag('title', e.data) + '\n') +
          '\n' +
          htmlTag('body', '', {closed: false, separate: true}),
          {closed: false, separate: true}))
      break

      case 'section':
        link = /^[^ "]+$/.test(e.data) ? e.data : e.data.replace(/"/g, '').replace(/ /g, '_')

        if (stack.length > 0 && stack[stack.length - 1][0] === 'section') {
          htag = 'h2'
          toc[toc.length - 1][2].push([e.data, '#' + link])
        } else {
          htag = 'h1'
          toc.push([e.data, '#' + link])
        }

        stack.push(['section', {indent: 2 * (stack.length + 1), separate: true}])
        result.push(htmlTag('section', '\n' + htmlTag(
            htag + ` id="${link}"`, e.data, {closed: false, indent: (2 * (stack.length + 1))}),
          {closed: false, indent: 2 * stack.length}))

        result[ result.length - 1] += closeTag(htag)
      break

      case 'list':
        stack.push(['ul', {indent: 2 * (stack.length + 1), separate: true}])
        result.push(htmlTag('ul', '', {closed: false, indent: 2 * stack.length}))
      break

      case 'item':
        result.push(htmlTag('li', e.data, {indent: 2 * (stack.length + 1)}))
      break

      case 'end':
        temp = stack.pop()

        result.push(closeTag(temp[0], temp[1]))
      break

      case 'text':
        result.push(`${'  '.repeat(stack.length + 1) + e.data + '\n'}`)
      break

      case 'link':
        result.push(`${'  '.repeat(stack.length + 1) + e.data + '\n'}`)
      break

      case 'image':
        result.push(selfTag(`img src=${e.data}`, {indent: 2 * (stack.length + 1)}))
      break

      case 'separator':
        result.push(selfTag('hr', {indent: 2 * (stack.length + 1), separate: true}))
      break

      case 'empty':
        result.push(selfTag('br', {indent: 2 * (stack.length + 1), separate: true}))
      break

      case 'table':
        stack.push(['table', {indent: 2 * (stack.length + 1), separate: true}])
        result.push('\n' + htmlTag('h2', e.data, {indent: 4}))
        result.push(htmlTag('table', '', {closed: false, indent: 2 * stack.length}))
      break

      case 'thead':
        if (e.data) {
          result.push(htmlTag('tr', '', {closed: false, indent: 2 * (stack.length + 1)}))
          stack.push(['tr', {indent: 2 * (stack.length + 1)}])

          e.data.split(',').forEach((h) => {
            result.push(htmlTag('th', h, {indent: 2 * (stack.length + 1)}))
          })

          result.push(closeTag('tr', {indent: 2 * (stack.length)}))
          stack.pop()
        } else {
          errors.push(`Missing content for tag ${e.tag}.`)
        }
      break

      case 'trow':
        if (e.data) {
          stack.push(['tr', {indent: 2 * (stack.length + 1)}])
          result.push(htmlTag('tr', '', {closed: false, indent: 2 * stack.length}))

          e.data.split(',')
            .filter((f) => f !== '')
            .forEach((d) => {
            result.push(htmlTag('td', d, {indent: 2 * (stack.length + 1)}))
          })

          result.push(closeTag('tr', {indent: 2 * (stack.length)}))
          stack.pop()
        } else {
          errors.push(`Missing data for tag ${e.tag}.`)
        }
      break

      default:
      break
    }
  })

  if(hasRoot) {
    result.push(closeTag('body'), closeTag('html', {separate: true}))
  }

  result = renderSecondaryTags(result)

  toc = renderToc(Array.from(toc))

  temp = result.join('\n')

  if (hasRoot) {
    start = temp.indexOf('<body>\n') + 6

    temp = `${temp.slice(0, start)}\n${toc}\n${temp.slice(start + 1)}`
  } else {
    temp = `${toc}\n${temp}`
  }

  hout.value = temp

  updateLines(hout.id)
}

function previewHtml () {
  const controls = document.getElementById('controls')
  const container = document.getElementById('container')
  const htmlContainer = document.getElementById('htmlContainer')

  controls.classList.toggle('previewing')
  controls.classList.toggle('editing')

  container.style.display = 'none'
  htmlContainer.style.display = 'block'

  document.getElementById('renderHtml').click()
  const code = document.getElementById('ta_output').value

  if (htmlContainer.innerHTML !== code) {
    htmlContainer.innerHTML = code
  }
}

function edit () {
  const controls = document.getElementById('controls')
  const container = document.getElementById('container')
  const htmlContainer = document.getElementById('htmlContainer')

  controls.classList.toggle('previewing')
  controls.classList.toggle('editing')

  container.style.display = 'block'
  htmlContainer.style.display = 'none'
}