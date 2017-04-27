'use strict'

const path = require('path')
const mkdirp = require('mkdirp')
const fs = require('fs')

const del = require('../lib/unlink')

const put = (base) => (link, target, cb) => {
	const src = path.join(base, ...link)

	mkdirp(path.dirname(src), (err) => {
		if (err) return cb(err)

		fs.access(src, fs.constants.R_OK, (err, data) => {
			if (err && err.code === 'ENOENT') return fs.symlink(target, src, cb)
			else cb()
		})
	})
}

module.exports = {put, del}
