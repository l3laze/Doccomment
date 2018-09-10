'use strict'

const path = require('path')
const afs = require('./asyncLib.js')
const findPJ = require('./findPJ.js')
const { humanize } = require('./humanize.js')
// const debug = require('ebug')('doccomment-json-to-markdown')

async function generate (json, options) {
  const pjPath = await findPJ(path.join(__dirname))
  const pj = JSON.parse(await afs.readFileAsync(pjPath))
  const docs = []

  const builder = {
    articleSeparator: '----',
    sectionSeparator: '## ------------',
    header: () => `# **\`${options.name || pj.name}\`** API Documentation<br />Version \`${options.version || pj.version}\`\n\n${builder.sectionSeparator}`,
    toc: () => {
      const tic = [ '### **Table of Contents**' ]

      for (let root of Object.keys(json.tree)) {
        for (let branch in json.tree[ root ]) {
          if (branch === 'module') {
            tic.push(`* \`Module\` [${json.tree[ root ][ branch ]}](#module-${json.tree[ root ].module.toLowerCase()})`)
          }

          if (/methods|properties/.test(branch)) {
            if (branch === 'properties') {
              tic.push(`  * [Properties](#module-${json.tree[ root ].module.toLowerCase()}-properties)`)
            } else if (branch === 'methods') {
              tic.push(`  * [Methods](#module-${json.tree[ root ].module.toLowerCase()}-methods)`)
            }

            for (let leaf of json.tree[ root ][ branch ]) {
              if (branch === 'properties') {
                tic.push(`    * [${leaf.name}](#${json.tree[ root ].module.toLowerCase()}-${leaf.name.toLowerCase()})`)
              } else if (branch === 'methods') {
                tic.push(`    * ${leaf.async ? '`async` ' : ''}[${leaf.name + (leaf.arguments ? ' (' + leaf.arguments.map((i) => {
                  return i.name + (i.default ? ` = ${i.default}` : '')
                }).join(', ') + ')' : '')}](#${json.tree[ root ].module.toLowerCase()}-${leaf.name.toLowerCase()})`)
              }
            }
          }
        }
      }

      return tic.join('\n')
    },
    makeBody: () => {
      const contents = []

      for (let root of Object.keys(json.tree)) {
        for (let branch in json.tree[ root ]) {
          if (branch === 'module') {
            contents.push(builder.articleSeparator, '\n')
            contents.push(`<a name='module-${json.tree[ root ].module.toLowerCase()}'></a>`)
            contents.push(`# Module ${json.tree[ root ][ branch ]}\n`)
            contents.push(builder.sectionSeparator)
          }

          if (/methods|properties/.test(branch)) {
            if (branch === 'properties') {
              contents.push(`\n<a name='module-${json.tree[ root ].module.toLowerCase()}-properties'></a>`)
              contents.push('## Properties\n')
              contents.push(builder.sectionSeparator, '\n')
              contents.push('| Name | Type | Description |')
              contents.push('| --- | --- | --- |')
            } else if (branch === 'methods') {
              contents.push(`\n<a name='module-${json.tree[ root ].module.toLowerCase()}-methods'></a>`)
              contents.push('## Methods\n')
              contents.push(builder.sectionSeparator)
            }

            for (let leaf in json.tree[ root ][ branch ]) {
              if (branch === 'properties') {
                contents.push(`| <a name='${json.tree[ root ].module.toLowerCase()}-${json.tree[ root ][ branch ][ leaf ].name.toLowerCase()}'></a> ${json.tree[ root ][ branch ][ leaf ].name} | ${json.tree[ root ][ branch ][ leaf ].type} | ${json.tree[ root ][ branch ][ leaf ].description}`)
              } else if (branch === 'methods') {
                contents.push(`\n<a name='${json.tree[ root ].module.toLowerCase()}-${json.tree[ root ][ branch ][ leaf ].name.toLowerCase()}'></a>`)
                contents.push(`#### ${json.tree[ root ][ branch ][ leaf ].async ? '`async` ' : ''} ${json.tree[ root ][ branch ][ leaf ].name +
                (json.tree[ root ][ branch ][ leaf ].arguments ? ' (' + json.tree[ root ][ branch ][ leaf ].arguments.map((i) => {
                  return i.name // + (i.default ? ` [default = ${i.default}]` : '')
                }).join(', ') + ')' : '')} \n\n${json.tree[ root ][ branch ][ leaf ].description}\n` +
                (json.tree[ root ][ branch ][ leaf ].arguments ? '> **Arguments**\n\n' + json.tree[ root ][ branch ][ leaf ].arguments.map((i) => {
                  return `* \`${i.name}\`` +
                  /* (i.default ? ` = ${i.default}` : '') + */
                  ` *is a* \`${i.type}\` ${(i.default
                    ? '[default = ' +
                      (i.type === 'String' ? '"' : '') +
                        i.default +
                      (i.type === 'String' ? '"' : '') +
                    ']' : '')
                  }\n>${i.description}\n\n`
                }).join('\n') : '') +
                (json.tree[ root ][ branch ][ leaf ].returns ? '\n> **Returns**\n\n' + json.tree[ root ][ branch ][ leaf ].returns.map((i) => {
                  return `* \`${i.type}\` - ${i.description}\n\n`
                }).join('\n') : '') +
                (json.tree[ root ][ branch ][ leaf ].throws ? '\n> **Throws**\n\n' + json.tree[ root ][ branch ][ leaf ].throws.map((i) => {
                  return `* \`${i.type}\` - ${i.description}\n\n`
                }).join('\n') : ''))

                contents.push(builder.sectionSeparator)
              }
            }

            if (branch === 'properties' && json.tree[ root ].methods) {
              contents.push(builder.sectionSeparator)
            }
          }
        }

        // Remove some of the separators (top of Properties/Methods, bottom of methods declarations before articleSeparator for next module or footer)
        /*
          if (contents[ contents.length - 1 ] === builder.sectionSeparator) {
            delete contents[ contents.length - 1 ]
          }
        */
      }

      return contents.join('\n')
    },
    footer: () => `${builder.articleSeparator}\n## Generated by [Doccomment.js](https://github.com/l3laze/Doccomment)...so, that's great and stuff.`
  }

  docs.push(builder.header())
  docs.push(builder.toc())
  docs.push(builder.makeBody())
  docs.push(builder.footer())

  const documentation = docs.join('\n')
  const out = path.join('.', options.out)
  console.info('Built %s @ %s from JSON @ %s.', options.out, humanize(documentation.length), humanize(JSON.stringify(json).length))
  await afs.writeFileAsync(out, documentation)
}

module.exports = {
  generate
}
