require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

app.get('/health', (_, res) => res.json({ ok: true }))

app.use('/api', require('./routes/analyze'))

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`NOORA backend on :${PORT}`))
