const router = require('express').Router()
const { User } = require('../model/User')
const bcrypt = require('bcrypt')
const Joi = require('joi')
const Token = require('../model/Token')
const SendEmail = require('../utils/SendEmail')
const crypto = require('crypto')

//Login
router.post('/login', async (req, res) => {
  try {
    const { error } = validate(req.body)
    error && res.status(200).send({ message: error.details[0].message })

    const user = await User.findOne({ email: req.body.email })
    !user && res.status(400).send({ message: 'Invalid Email' })

    const validPassword = await bcrypt.compare(req.body.password, user.password)
    !validPassword && res.status(400).send({ message: 'Invalid Password' })

    if (!user.verified) {
      let token = await Token.findOne({ userId: user._id })
      if (!token) {
        token = await new Token({
          userId: user._id,
          token: crypto.randomBytes(32).toString('hex'),
        }).save()
        const url = `${process.env.BASE_URL}/users/${user._id}/verify/${token.token}`
        await SendEmail(user.email, 'Verify Email', url)
      }
      return res
        .status(400)
        .send({ message: 'Require to approve from admin!' })
    }

    // const token = user.generateAuthToken()

    const { password, ...other } = user._doc
    res.status(200).send({ data: other, message: 'LoggedIn Successfully!' })
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
})

const validate = (data) => {
  const schema = Joi.object({
    email: Joi.string().required().label('Email'),
    password: Joi.string().required().label('Password'),
  })
  return schema.validate(data)
}

module.exports = router
