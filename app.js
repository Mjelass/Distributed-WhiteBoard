// Import dependencies
const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const path = require('path')

// Create Express app and server
const app = express()
const server = http.createServer(app)

// MongoDB Connection
const mongoUrl = 'mongodb://mongo:27017/mydatabase'
/* 'mongodb+srv://admin:cvtzt5JW0VUmUgPw@cluster0.bhohcl2.mongodb.net/?retryWrites=true&w=majority'*/

mongoose.connect(mongoUrl)

const db = mongoose.connection

db.on('error', (err) => {
  console.error('Error connecting to MongoDB:', err)
})

db.once('open', () => {
  console.log('Connected to MongoDB database')

  // Define the drawing schema
  const drawingSchema = new mongoose.Schema({
    x: Number,
    y: Number,
  })

  // Create a drawing model
  const Drawing = mongoose.model('Drawing', drawingSchema)

  // Serve static files
  app.use(express.static(path.join(__dirname, 'public')))

  // Route for serving HTML file
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
  })

  // Route for fetching drawing history
  app.get('/drawings', async (req, res) => {
    try {
      // Fetch existing drawing data from the MongoDB collection
      const results = await Drawing.find()
      const drawHistory = results.map((doc) => ({ x: doc.x, y: doc.y }))
      res.json(drawHistory)
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch drawing history' })
    }
  })

  // Route for saving drawing data
  app.post('/drawings', express.json(), async (req, res) => {
    const { x, y } = req.body

    try {
      // Save drawing data to MongoDB collection
      await Drawing.create({ x, y })
      res.sendStatus(200)
    } catch (err) {
      res.status(500).json({ error: 'Failed to save drawing data' })
    }
  })

  // Define the port and start the server
  const port = process.env.PORT || 3000
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
})
