'use strict'

const path = require('path')
const createCollections = require('..')

const tag = require('../tag/json')
const {put, del} = require('../apply/hardlinks')
// const {put, del} = require('../apply/symlinks')

const src = path.join(__dirname, 'src')
const dest = path.join(__dirname, 'dest')

createCollections(src, tag, put(dest), del(dest))
.on('error', console.error)
.on('data', (file) => console.log(file.basename))
