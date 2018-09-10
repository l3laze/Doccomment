# Doccomment
A *very* simple JSDoc-like documentation parser & documentation generator for NodeJS modules. Will not be getting a lot more tag support than it already has (as I don't feel it is needed).

[![Known Vulnerabilities](https://snyk.io/test/github/l3laze/doccomment/badge.svg?targetFile=package.json)](https://snyk.io/test/github/l3laze/doccomment?targetFile=package.json)

[![Dependencies](https://img.shields.io/david/l3laze/doccomment.svg)](https://github.com/l3laze/doccomment/issues) [![Dev Dependencies](https://img.shields.io/david/dev/l3laze/doccomment.svg)](https://github.com/l3laze/doccomment) [![Peer Dependencies](https://img.shields.io/david/peer/l3laze/doccomment.svg)](https://github.com/l3laze/doccomment)

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

----


# **Warning**

This is not intended for use in anything important. It was mostly just a "can I do it?" project, and not some attempt to replace JSDoc or similar tools. It has not been well-tested or documented, and the code is a nightmare.


----


# **Usage**


## **Install**


`yarn add doccomment` - to install locally to a single project.

`yarn global add doccomment` - to install globally and enable use as a command.


----



## **Synopsis**


`node /path/to/doccomment.js [options]`


----


## **Examples**


Parse documentation using default values from `package.json`:

`node /path/to/doccomment.js`

***or***&nbsp; if installed globally:

`doccomment`

----

Recursively parse documentation for project `--name` of version `--version` starting with the source directory `--source` and targeting files that match `--pattern`. Generate output with a custom `--generator`, and write it to `--out`.

`node /path/to/doccomment.js --name Test --version 1.0 --source ./ --pattern test --generator ./node_modules/doccomment-to-html/index.js --recursive --out test.html`

***or***&nbsp; if installed globally:

`doccomment --name Test --version 1.0 --source ./ --pattern test --generator ./node_modules/doccomment-to-html/index.js --recursive --out test.html`


----


## **Options**


##### `String` name (-n|--name)
> Name of the project; defaults to {./package.json}.name.


##### `String` version (-v|--version)
> Documentation version; defaults to `{./package.json}.version`.


##### `Path` source (-s|--source)
> The directory to search for source files to extract docs from; defaults to `./src`.


##### `RegExp|String` pattern (-t|--pattern)
> A pattern to select/ignore input files; defaults to `/\*\.js/`.


##### `String` format (-f|--format)
> Format of output; defaults to `md`.


##### `Path` generator (-g|--generator)
> Generator script for format; defaults to `undefined`.


##### `Path` intermediary (-i|--intermediary)
> Intermediary (JSON) output file; defaults to `./doccomments.json`.


##### `Path` out (-o|--out)
> The output file; defaults to `./API.md`.


##### `Boolean` recursive (-r|--recursive)
> Recursively search for files in source directory; defaults to `false`.


##### `Boolean` extract (-e|--extract)
> Extract documentation comments, but do not parse them; defaults to `false`.


##### `Boolean` parse (-p|--parse)
> Parse to intermediary JSON, but do not build docs; defaults to `false`.


----


# **Supported Tags**


#### **@module <name\>**
> The name of a module


#### **@description <text\>**
> Description for a module or method.


#### **@property {type} <name\> - <description\>**
> A property of a module.


#### **@method <name\>**
> The name of a method.


#### **@async**
> Method is async


#### **@argument {type} <name\> - <description\>**
> Argument to a method


#### **@returns {type} - <description\>**
> Return value from a method.


#### **@throws {type} - <description\>**
> Method throws.

----