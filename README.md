# Doccomment
A *very* simple JSDoc-like documentation parser & documentation generator for NodeJS modules. Will not be getting a lot more tag support than it already has (as I don't feel it is needed).

[![Known Vulnerabilities](https://snyk.io/test/github/l3laze/doccomment/badge.svg?targetFile=package.json)](https://snyk.io/test/github/l3laze/doccomment?targetFile=package.json)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fl3laze%2FDoccomment.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fl3laze%2FDoccomment?ref=badge_shield)

[![Dependencies](https://img.shields.io/david/l3laze/doccomment.svg)](https://github.com/l3laze/doccomment/issues) [![Dev Dependencies](https://img.shields.io/david/dev/l3laze/doccomment.svg)](https://github.com/l3laze/doccomment) [![Peer Dependencies](https://img.shields.io/david/peer/l3laze/doccomment.svg)](https://github.com/l3laze/doccomment)

[![JavaScript Style Guide](https://cdn.rawgit.com/standard/standard/master/badge.svg)](https://github.com/standard/standard)

----

# **CLI Usage**


`node /path/to/doccomment.js [options] [flags]`


## **Options**


##### `String` name (-n|--name)
> Name of the project; defaults to {./package.json}.name.


##### `String` version (-v|--version)
> Documentation version; defaults to `{./package.json}.version`.


##### `Path` source (-s|--source)
> The directory to search for source files to extract docs from; defaults to `./src`.


##### `RegExp|String` pattern (-p|--pattern)
> A pattern to select/ignore input files; defaults to `/\*\.js/`.


##### `String` format (-f|--format)
> Format of output; defaults to `md`.


##### `Path` generator (-g|--generator)
> Generator script for format; defaults to `undefined`.


##### `Path` intermediary (-i|--intermediary)
> Intermediary (JSON) output file; defaults to `./doccomments.json`.


##### `Path` out (-o|--out)
> The output file; defaults to `./API.md`.


# ----


## **Flags**


##### `Boolean` recursive (-r|--recursive)
> Recursively search for files in source directory; defaults to `false`.


##### `Boolean` extract (-eo|--extract)
> Extract documentation comments, but do not parse them; defaults to `false`.


##### `Boolean` parse (-po|--parse)
> Parse to intermediary JSON, but do not build docs; defaults to `false`.


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fl3laze%2FDoccomment.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fl3laze%2FDoccomment?ref=badge_large)