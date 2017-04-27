'use strict'

const path = require('path')
const fs = require('fs')
const createCollections = require('..')

const tag = require('../tag/json')
const {put, del} = require('../apply/hardlinks')
// const {put, del} = require('../apply/symlinks')
const treeCache = require('../lib/tree-cache')

const showError = (err) => {
	if (!err) return
	console.error(err)
	process.exit(1)
}

const src = path.join(__dirname, 'src')
const dest = path.join(__dirname, 'dest')

const cache = treeCache(path.join(__dirname, 'tree.json'))

cache.read((err, tree) => {
	if (err) return showError(err)

	createCollections(src, tag, put(dest), del(dest), {
		oldTree: tree,
		saveTree: (tree) => cache.write(tree, showError)
	})
	.on('error', console.error)
	.on('data', (file) => {})
})
