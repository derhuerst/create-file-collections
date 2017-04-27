'use strict'

const path = require('path')
const mkdirp = require('mkdirp')
const fs = require('fs')

const del = require('./lib/unlink')

const put = (base) => (link, target, cb) => {
	const src = path.join(base, ...link)

	mkdirp(path.dirname(src), (err) => {
		if (err) return cb(err)

		fs.link(target, src, cb)
	})
}

module.exports = {put, del}
