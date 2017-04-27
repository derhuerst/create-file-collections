'use strict'

const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')

const storage = (file) => {
	const read = (cb) => {
		fs.access(file, fs.constants.R_OK, (err) => {
			if (err) {
				if (err.code === 'ENOENT') cb(null, {})
				else cb(err)
			} else {
				fs.readFile(file, (err, data) => {
					if (err) cb(err)
					else cb(null, JSON.parse(data))
				})
			}
		})
	}

	const write = (tree, cb) => {
		mkdirp(path.dirname(file), (err) => {
			if (err) return cb(err)

			fs.writeFile(file, JSON.stringify(tree), cb)
		})
	}

	return {read, write}
}

module.exports = storage
