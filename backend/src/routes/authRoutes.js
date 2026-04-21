const express = require('express')
const router = express.Router()
const { login } = require('../controllers/authController')

router.post('/token', login)

module.exports = router