require('dotenv').config()

const express = require('express')
const cors = require('cors')
const runSeed = require('./database/seeders/seed')
const authRoutes = require('./routes/authRoutes')
const childrenRoutes = require('./routes/childrenRoutes')
const summaryRoutes = require('./routes/summaryRoutes')

const app = express()
const authMiddleware = require('./middleware/auth');

app.use(cors())
app.use(express.json())

runSeed()

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando!' })
})

app.use('/auth', authRoutes)
app.use(authMiddleware);
app.use('/children', childrenRoutes)
app.use('/summary', summaryRoutes)

module.exports = app