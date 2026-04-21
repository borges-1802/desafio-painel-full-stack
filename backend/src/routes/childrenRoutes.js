const express = require('express')
const router = express.Router()
const { listChildren, getChild } = require('../controllers/childrenController')

router.get('/', listChildren)
router.get('/:id', getChild)

module.exports = router