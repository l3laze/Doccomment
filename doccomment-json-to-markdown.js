'use strict'

const path = require('path')
const afs = require('./asyncLib.js')

async function generate (json, options) {
  const pj = JSON.parse(await afs.readFileAsync(path.join(__dirname, 'package.json')))
  const docs = []
  // let indent = 0

  const builder = {
    articleSeparator: '----',
    sectionSeparator: '## ------------',
    header: () => `# **\`${options.name || pj.name}\`** API Documentation<br />Version \`${options.version || pj.version}\`\n${builder.sectionSeparator}`,
    toc: () => {
      const tic = [ `### **[Table of Contents]()**` ]

      for (let root of Object.keys(json.tree)) {
        for (let branch in json.tree[ root ]) {
          if (branch === 'module') {
            tic.push(`* \`Module\` [${json.tree[ root ][ branch ]}](#module-${json.tree[ root ].module.toLowerCase()})`)
          }

          if (/methods|properties/.test(branch)) {
            if (branch === 'properties') {
              tic.push(` * [Properties](#module-${json.tree[ root ].module.toLowerCase()}-properties)`)
            } else if (branch === 'methods') {
              tic.push(` * [Methods](#module-${json.tree[ root ].module.toLowerCase()}-methods)`)
            }

            for (let leaf of json.tree[ root ][ branch ]) {
              if (branch === 'properties') {
                tic.push(`   * [${leaf.name}](#${json.tree[ root ].module.toLowerCase()}.${leaf.name.toLowerCase()})`)
              } else if (branch === 'methods') {
                tic.push(`   * ${leaf.async ? '`async` ' : ''}[${leaf.name + (leaf.arguments ? ' (' + leaf.arguments.map((i) => {
                  return i.name + (i.default ? ` = ${i.default}` : '')
                }).join(', ') + ')' : '')}](#${json.tree[ root ].module.toLowerCase()}.${leaf.name.toLowerCase()})`)
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
            contents.push(builder.articleSeparator)
            contents.push(`# Module [${json.tree[ root ][ branch ]}](module-${json.tree[ root ].module.toLowerCase()})`)
            contents.push(builder.sectionSeparator)
          }

          if (/methods|properties/.test(branch)) {
            if (branch === 'properties') {
              contents.push(`## [Properties](module-${json.tree[ root ].module.toLowerCase()}-properties)`)
              contents.push(builder.sectionSeparator)
              contents.push(`| Name | Type | Description |`)
              contents.push(`| --- | --- | --- |`)
            } else if (branch === 'methods') {
              contents.push(`## [Methods](module-${json.tree[ root ].module.toLowerCase()}-methods)`)
              contents.push(builder.sectionSeparator)
            }

            for (let leaf in json.tree[ root ][ branch ]) {
              if (branch === 'properties') {
                contents.push(`| [${json.tree[ root ][ branch ][ leaf ].name}](${json.tree[ root ].module.toLowerCase()}.${json.tree[ root ][ branch ][ leaf ].name.toLowerCase()}) | ${json.tree[ root ][ branch ][ leaf ].type} | ${json.tree[ root ][ branch ].description}`)
              } else if (branch === 'methods') {
                contents.push(`#### ${json.tree[ root ][ branch ][ leaf ].async ? '`async` ' : ''}[${json.tree[ root ][ branch ][ leaf ].name + (json.tree[ root ][ branch ][ leaf ].arguments ? ' (' + json.tree[ root ][ branch ][ leaf ].arguments.map((i) => {
                  return i.name + (i.default ? ` = ${i.default}` : '')
                }).join(', ') + ')' : '')}](${json.tree[ root ].module.toLowerCase()}.${json.tree[ root ][ branch ][ leaf ].name.toLowerCase()})\n${json.tree[ root ][ branch ][ leaf ].description}\n` +
                (json.tree[ root ][ branch ][ leaf ].arguments ? '> **Arguments**\n\n' + json.tree[ root ][ branch ][ leaf ].arguments.map((i) => {
                  return `* \`${i.name}\`` + (i.default ? ` = ${i.default}` : '') + ` *is a* \`${i.type}\` - ${i.description}\n\n`
                }).join('\n') + '\n' : '') +
                (json.tree[ root ][ branch ][ leaf ].returns ? '\n> **Returns**\n\n' + json.tree[ root ][ branch ][ leaf ].returns.map((i) => {
                  return `* \`${i.type}\` - ${i.description}\n\n`
                }).join('\n') + '\n' : '') +
                (json.tree[ root ][ branch ][ leaf ].throws ? '\n> **Throws**\n\n' + json.tree[ root ][ branch ][ leaf ].throws.map((i) => {
                  return `* \`${i.type}\` - ${i.description}\n\n`
                }).join('\n') + '\n' : ''))

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
    footer: () => `${builder.articleSeparator}\n## Generated by [Doccomment.js]()...so, that's great and stuff.`
  }

  docs.push('<a name="page_top"></a>')
  docs.push(builder.header())
  docs.push(builder.toc())
  docs.push(builder.makeBody())
  docs.push(builder.footer())

  return docs.join('\n\n\n')
}

module.exports = {
  generate
}
