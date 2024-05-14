import express from 'express'
import aircraft from './routes/aircraft'

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use('/aircraft', aircraft)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})

// const testStrings = [
//   'http://localhost:3000/aircraft?type=arrival&airport=EDDF&begin=1517227200&end=1517230800',
//   'http://localhost:3000/aircraft?type=departure&airport=EDDF&begin=1517227200&end=1517230800',
// ]

export default app
