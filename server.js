require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const bodyparser = require('body-parser')
const cors = require('cors')
const app = express()
const connectionDB = require('./db')
const userRoutes = require('./routes/user')
const authRoutes = require('./routes/auth')
const passwordResetRoute = require('./routes/passwordReset')
const postRoute = require('./routes/posts')
const categoryRoute = require('./routes/categories')
const multer = require('multer')
const path = require('path')
const port = 8000

//MongoDB Connection
connectionDB()

//Middleware
app.use(bodyparser.json())
app.use(cors())

//Image File Path
app.use('/images', express.static(path.join(__dirname, '/images')))
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images')
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name)
  },
})

const upload = multer({ storage: fileStorage })
app.post('/api/upload', upload.single('file'), (req, res) => {
  res.status(200).send({message: "File has been uploaded!"})
})

//Routes
app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/password-reset', passwordResetRoute)
app.use('/api/posts', postRoute)
app.use('/api/categories', categoryRoute)

app.listen(port, () => console.log(`Server running at port ${port}...`))
