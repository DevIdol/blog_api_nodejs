const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Joi = require('joi')
const passwordComplexity = require('joi-password-complexity')
const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    username: { type: String, min: 3, max: 20, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, min: 6, required: true },
    profilePic: { type: String, default: '' },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

// UserSchema.methods.generateAuthToken = function () {
//   const user = {
//     _id: this._id,
//     username: this.username,
//     email: this.email,
//     profilePic: this.profilePic,
//   }
//   // const refreshToken = jwt.sign(user, process.env.JWTREFRESHKEY)
//   const token = jwt.sign(user, process.env.JWTPRIVATEKEY, {
//     expiresIn: '30s',
//   })
//   return token
// }

const User = mongoose.model('user', UserSchema)

const validate = (data) => {
  const schema = Joi.object({
    username: Joi.string()
      .min(3)
      .max(20)
      .required()
      .label('Username'),
    email: Joi.string().email().required().label('Email'),
    password: passwordComplexity().required().label("Password")
  })
  return schema.validate(data)
}
module.exports = { User, validate }
