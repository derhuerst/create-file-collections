'use strict'

const path = require('path')
const fs = require('fs')

const unlink = (base) => (link, target, cb) => {
	const src = path.join(base, ...link)
	fs.unlink(src, cb)
}

module.exports = unlink
