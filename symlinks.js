'use strict'

const path = require('path')
const mkdirp = require('mkdirp')
const fs = require('fs')

const del = require('./lib/unlink')

const put = (base) => (link, target, cb) => {
	const src = path.join(base, ...link)

	mkdirp(path.dirname(src), (err) => {
		if (err) return cb(err)

		fs.symlink(target, src, cb)
	})
}

module.exports = {put, del}
