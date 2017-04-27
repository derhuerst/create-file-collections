'use strict'

const noop = require('lodash/noop')
const {src} = require('vinyl-fs')
const path = require('path')
const through = require('through2')
const parallel = require('async/parallel')
const differenceWith = require('lodash/differenceWith')
const isEqual = require('lodash/isEqual')

const defaults = {
	oldTree: {},
	saveTree: noop
}

const createCollections = (dir, computeLinks, put, del, opt = {}) => {
	opt = Object.assign({}, defaults, opt)
	const tree = {}

	return src([
		path.join(dir, '**')
	], {read: false})

	.pipe(through.obj(function (file, _, cb) {
		if (!file.stat.isFile()) return cb()
		const self = this

		computeLinks(file, (err, links) => {
			if (err) return cb(err)
			if (!links) return cb()
			if (!Array.isArray(links)) {
				return cb(new Error('links must be an array'))
			}

			file.links = links
			self.push(file)
			cb()
		})
	}))

	// todo: targets in opt.oldTree, but not in tree

	.pipe(through.obj(function (file, _, cb) {
		const self = this

		const newLinks = file.links
		const oldLinks = opt.oldTree[file.relative] || []
		const tasks = []

		const toDel = differenceWith(oldLinks, newLinks, isEqual)
		for (let link of toDel) {
			tasks.push(del.bind({}, link, file.path))
		}

		const toPut = differenceWith(newLinks, oldLinks, isEqual)
		for (let link of toPut) {
			tasks.push(put.bind({}, link, file.path))
		}

		parallel(tasks, (err) => {
			tree[file.relative] = newLinks

			if (!err) self.push(file)
			cb(err)
		})
	}))

	.on('end', () => opt.saveTree(tree))
}

module.exports = createCollections
