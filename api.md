# **`doccomment`** API Documentation<br />Version `0.0.3-rc4`

## ------------
### **Table of Contents**
* `Module` [Doccomment](#module-doccomment)
  * [Methods](#module-doccomment-methods)
    * `async` [extractFromFile (data)](#doccomment-extractfromfile)
    * `async` [extractDocumentation (src, pattern, recursive)](#doccomment-extractdocumentation)
    * `async` [extractDocs (src, pattern, recursive)](#doccomment-extractdocs)
    * `async` [createDoccomment](#doccomment-createdoccomment)
    * `async` [findLines (lines, pattern)](#doccomment-findlines)
    * `async` [getChunk (data, begin, end)](#doccomment-getchunk)
    * `async` [parseTypedEntry (entry, withName)](#doccomment-parsetypedentry)
    * `async` [parse (comment)](#doccomment-parse)
    * `async` [compress (root)](#doccomment-compress)
    * `async` [build (src)](#doccomment-build)
    * `async` [parseDocs (options)](#doccomment-parsedocs)
    * `async` [makeDocs (options)](#doccomment-makedocs)
----


<a name='module-doccomment'></a>
# Module Doccomment

## ------------

<a name='module-doccomment-methods'></a>
## Methods

## ------------

<a name='doccomment-extractfromfile'></a>
#### `async`  extractFromFile (data) 

Extract doccomments as array of lines from file contents as a string.
> **Arguments**

* `data` *is a* `String` 
>The array of lines from a file to extract doccomments from.


## ------------

<a name='doccomment-extractdocumentation'></a>
#### `async`  extractDocumentation (src, pattern, recursive) 

Extract doccomments from source files.
> **Arguments**

* `src` *is a* `String` 
>Source directory.


* `pattern` *is a* `String` 
>File pattern to search for; inclusive.


* `recursive` *is a* `Boolean` 
>Recursive if true, and will descend into child directories.


> **Returns**

* `Object` - The parsed documentation tree.


## ------------

<a name='doccomment-extractdocs'></a>
#### `async`  extractDocs (src, pattern, recursive) 

Extract doccomments from source files.
> **Arguments**

* `src` *is a* `String` 
>Source directory.


* `pattern` *is a* `String` 
>File pattern to search for; inclusive.


* `recursive` *is a* `Boolean` 
>Recursive if true, and will descend into child directories.


> **Returns**

* `Object` - The parsed documentation tree.


## ------------

<a name='doccomment-createdoccomment'></a>
#### `async`  createDoccomment 

Create an object to hold a single doccomment.

> **Returns**

* `Object` - The creates doccomment object.


## ------------

<a name='doccomment-findlines'></a>
#### `async`  findLines (lines, pattern) 

Filter an array of lines to only the lines that match a pattern.
> **Arguments**

* `lines` *is a* `Array` 
>The array of lines to search.


* `pattern` *is a* `String` 
>The pattern to search for.


> **Returns**

* `Array` - The lines that match the pattern.


## ------------

<a name='doccomment-getchunk'></a>
#### `async`  getChunk (data, begin, end) 

Extract the substring between `begin` and `end` from a string.
> **Arguments**

* `data` *is a* `String` 
>The base string to extract the chunk from.


* `begin` *is a* `String` 
>The beginning pattern to search for.


* `end` *is a* `String` 
>The ending pattern to search for.


> **Returns**

* `String` - The extracted chunk.


## ------------

<a name='doccomment-parsetypedentry'></a>
#### `async`  parseTypedEntry (entry, withName) 

Parse a doccomment that includes a type, e.g.: arg, property, throws, returns
> **Arguments**

* `entry` *is a* `String` 
>The line to parse.


* `withName` *is a* `Boolean` 
>Expect to find a name (for arg & param).


> **Returns**

* `Object` - The parsed entry, like `{ description, type }` with arg and param optionally including `name` and `default`.


> **Throws**

* `Error` - To propagates errors.


## ------------

<a name='doccomment-parse'></a>
#### `async`  parse (comment) 

Parse a single line and create a doccomment Object using it's data.
> **Arguments**

* `comment` *is a* `String` 
>The line to parse.


> **Returns**

* `Object` - An object representing the parsed doccomment.


> **Throws**

* `Error` - To propagates errors.


## ------------

<a name='doccomment-compress'></a>
#### `async`  compress (root) 

Prune a doccomment tree, removing empty branches and leaves (entries for methods, properties, modules). Also restructures by adding all methods and properties to the root instead of letting them branch out.
> **Arguments**

* `root` *is a* `Doccomment` 
>A doccomment to prune.


> **Returns**

* `Object` - An object representing the doccomment after removing empty parts and restructuring.


## ------------

<a name='doccomment-build'></a>
#### `async`  build (src) 

Convert intermediary version of parsed doccomments to a more useful version, recursively.
> **Arguments**

* `src` *is a* `String` 
>A tree of doccomments from extractDoccomments.


> **Returns**

* `Object` - A tree of doccomments like `tree: { module: { branches... }}`


> **Throws**

* `Error` - To propagate errors.


## ------------

<a name='doccomment-parsedocs'></a>
#### `async`  parseDocs (options) 

Handle parsing, and if args say so building, documentation.
> **Arguments**

* `options` *is a* `Object` 
>CLI options as an object of `{ name: val }`.


> **Returns**

* `Object` - The parsed docs based on options -- intermediary or human readable.


> **Throws**

* `Error` - To propagate errors.


## ------------

<a name='doccomment-makedocs'></a>
#### `async`  makeDocs (options) 

Uses the generator from options.generator, or the default markdown generator, to build human-readable docs; also writes them to disk.
> **Arguments**

* `options` *is a* `Object` 
>CLI options as an object of `{ name: val }`.


> **Throws**

* `Error` - To propagate errors.


## ------------
----
## Generated by [Doccomment.js](https://github.com/l3laze/Doccomment)...so, that's great and stuff.