const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
})

const Token = mongoose.model('token', TokenSchema)

module.exports = Token
