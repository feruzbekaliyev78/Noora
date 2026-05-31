require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

const ALLOWED_ORIGINS = [
  'https://noorauz.netlify.app',
  'http://localhost:5173',
  'http://localhost:4173'
]

app.use(cors({
  origin(origin, callback) {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`))
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}))

app.use(express.json({ limit: '10mb' }))

app.get('/health', (_, res) => res.json({ ok: true }))

app.use('/api', require('./routes/analyze'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`NOORA backend on :${PORT}`))
