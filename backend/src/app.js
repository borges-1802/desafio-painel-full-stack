const express = require('express')
const cors = require('cors')
const runSeed = require('./database/seeders/seed')

const app = express()

app.use(cors())
app.use(express.json())

runSeed()

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando!' })
})

module.exports = app