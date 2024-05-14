import express from 'express'
import aircraft from './routes/aircraft'
var cors = require('cors')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors({ origin: 'http://localhost:3000' }))
app.use('/aircraft', aircraft)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

export default app
