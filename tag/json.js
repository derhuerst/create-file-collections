'use strict'

const path = require('path')
const fs = require('fs')

const tag = function (file, cb) {
	fs.readFile(file.path, {encoding: 'utf8'}, (err, data) => {
		if (err) return cb(err)
		try {
			data = JSON.parse(data)

			const links = []
			for (let key in data) {
				links.push([key, data[key], file.basename])
			}

			cb(null, links)
		} catch (err) {
			cb(err)
		}
	})
}

module.exports = tag
