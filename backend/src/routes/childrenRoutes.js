const express = require('express')
const router = express.Router()
const { listChildren, getChild, reviewChild } = require('../controllers/childrenController')
const authMiddleware = require('../middleware/auth')

router.get('/', listChildren)
router.get('/:id', getChild)
router.patch('/:id/review', authMiddleware, reviewChild)

module.exports = router