require('dotenv').config()

const express = require('express')
const cors = require('cors')
const runSeed = require('./database/seeders/seed')
const authRoutes = require('./routes/authRoutes')
const childrenRoutes = require('./routes/childrenRoutes')

const app = express()

app.use(cors())
app.use(express.json())

runSeed()

app.use('/auth', authRoutes)
app.use('/children', childrenRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando!' })
})

module.exports = app