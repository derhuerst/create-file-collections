# create-file-collections

**Sort files into collections, e.g. music or documents.**

[![npm version](https://img.shields.io/npm/v/create-file-collections.svg)](https://www.npmjs.com/package/create-file-collections)
[![build status](https://img.shields.io/travis/derhuerst/create-file-collections.svg)](https://travis-ci.org/derhuerst/create-file-collections)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/create-file-collections.svg)
[![chat on gitter](https://badges.gitter.im/derhuerst.svg)](https://gitter.im/derhuerst)


## Installing

```shell
npm install create-file-collections
```


## Guide

**`create-file-collections` lets you sort files in a directory into collections of links**. Consider the following music files:

```
src/
	foo.mp3
	bar.mp3
	baz.mp3
```

We want to sort them into collections of [symlinks](https://en.wikipedia.org/wiki/Symbolic_link).

```
albums/
	Hey/
		a.mp3 -> ../../src/foo.mp3
		c.mp3 -> ../../src/baz.mp3
	Ho/
		b.mp3 -> ../../src/bar.mp3
years/
	2004/
		a.mp3 -> ../../src/foo.mp3
		b.mp3 -> ../../src/bar.mp3
	2006/
		c.mp3 -> ../../src/baz.mp3
```

Let's define **a function `computeLinks` that computes the collections a file belongs to.** For the sake of simplicity, I shortened the ID3 tag parsing code.

```js
const computeLinks = (file, cb) => {
	readID3Tags(file.path, (err, tags) => {
		if (err) return cb(err)

		const links = []
		for (let tag in tags) {
			const value = tags[tag]
			links.push([tag, value, file.basename])
		}

		cb(null, links)
	})
}
```

Because **`create-file-collections` is agnostic about where and how to store links, we need to provide two functions** `put` (to create them) and `del` (to delete them).

This is a simplified implementation for creating [symlinks](https://en.wikipedia.org/wiki/Symbolic_link):

```js
const fs = require('fs')

const put = (link, target, cb) => {
	fs.access(link, fs.constants.R_OK, (err) => {
		if (err && err.code === 'ENOENT') {
			fs.symlink(target, link, cb)
		} else cb()
	})
}

const del = (link, target, cb) => {
	fs.unlink(link, cb)
}
```

Now, to run the sorting process, pass everything into `createCollections`. It returns a [readable stream](https://nodejs.org/api/stream.html#stream_readable_streams), so we can listen to `data` events.

```js
createCollections(dir, computeLinks, put, del)
.on('error', console.error)
.on('data', (file) => {
	console.log(file.relative, file.links)
})
```


## Caching

To speed up the sorting process, `create-file-collections` will add all files and their links to an object. It looks like this:

```js
{
	'foo.mp3': [
		['albums', 'Hey', 'a.mp3'],
		['years', '2004', 'a.mp3']
	],
	'bar.mp3': [
		['albums', 'Ho', 'b.mp3'],
		['years', '2004', 'b.mp3']
	],
	'baz.mp3': [
		['albums', 'Hey', 'c.mp3'],
		['years', '2006', 'c.mp3']
	]
}
```

If you provide this object when calling `createCollections` again, it will only tell you to create and delete *the necessary* links:

```js
const oldTree = {…} // retrieve the last tree somehow

createCollections('path/to/src/dir', computeLinks, put, del, {
	oldTree: oldTree,
	saveTree: (newTree) => {
		// store the new tree somehow
	}
})
```


## API

```js
createCollections('path/to/src/dir', computeLinks, put, del, opt = {})
```

Returns a [readable stream](https://nodejs.org/api/stream.html#stream_readable_streams) in object mode, emitting [vinyl](https://github.com/gulpjs/vinyl) file objects.

1. `dir`
	- must be a valid directory
2. `computeLinks(file, cb)`
	- `file` is a [`vinyl` object](https://github.com/gulpjs/vinyl#vinyl)
	- must call `cb` with a list of links
3. `put(link, target, cb)`
	- must *create* a link from `link` to `target`
4. `del(link, target, cb)`
	- must *delete* a link from `link` to `target`

`opt.oldTree` must be an object, mapping file paths to lists of links. It should resemble the tree generated before.

`opt.saveTree(tree, cb)` should persist the newly generate tree of links.


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/create-file-collections/issues).
