const mongoose = require('mongoose')

module.exports = () => {
  const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
  try {
    mongoose.connect(process.env.DB, connectionParams)
    console.log('MongoDB is Connected!...')
  } catch (error) {
    console.log('Could not connected to MongoDB...', error)
  }
}
