'use strict'

const {src} = require('vinyl-fs')
const path = require('path')
const through = require('through2')
const parallel = require('async/parallel')

const createCollections = (dir, computeLinks, put, del) => {
	return src([
		path.join(dir, '**')
	], {read: false})

	.pipe(through.obj(function (file, _, cb) {
		if (!file.stat.isFile()) return cb()
		const self = this

		computeLinks(file, (err, links) => {
			if (err) return cb(err)
			if (!links) return cb()

			file.links = links
			self.push(file)
			cb()
		})
	}))

	.pipe(through.obj(function (file, _, cb) {
		const self = this

		const tasks = file.links.map((link) => put.bind({}, link, file.path))
		parallel(tasks, (err) => {
			if (!err) self.push(file)
			cb(err)
		})
	}))
}

module.exports = createCollections
