const router = require('express').Router()
const { User } = require('../model/User')
const Token = require('../model/Token')
const crypto = require('crypto')
const sendEmail = require('../utils/SendEmail')
const Joi = require('joi')
const passwordComplexity = require('joi-password-complexity')
const bcrypt = require('bcrypt')

//Send Password link
router.post('/', async (req, res) => {
  try {
    const emailSchema = Joi.object({
      email: Joi.string().email().required().label('Email'),
    })
    const { error } = emailSchema.validate(req.body)
    error && res.status(400).send({ message: error.details[0].message })

    const user = await User.findOne({ email: req.body.email })
    !user && res.status(409).send({ message: "User with given doesn't exist!" })

    let token = await Token.findOne({
      userId: user._id,
    })
    if (!token) {
      token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString('hex'),
      }).save()
    }
    const url = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}`
    await sendEmail(user.email, 'Password Reset', url)
    res
      .status(200)
      .send({ message: 'Password reset link sent to your account!' })
  } catch (error) {
    res.status(500).send({ message: 'Internal server error!' })
  }
})

//Verify URL
router.get('/:id/:token', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id })
    !user && res.status(400).send({ message: 'Invalid link' })

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    })
    !token && res.status(400).send({ message: 'Invalid link' })

    res.status(200).send({ message: 'Valid URL' })
  } catch (error) {
    res.status(500).send({ message: 'Internal server error!' })
  }
})

//Reset Password

router.post('/:id/:token', async (req, res) => {
  try {
    const passwordSchema = Joi.object({
      password: passwordComplexity().required().label('Password'),
    })
    const { error } = passwordSchema.validate(req.body)
    error && res.status(400).send({ message: error.details[0].message })

    const user = await User.findOne({ _id: req.params.id })
    !user && res.status(400).send({ message: 'Invalid link' })

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    })
    !token && res.status(400).send({ message: 'Invalid link' })

    if (!user.verified) user.verified = true

    const salt = await bcrypt.genSalt(Number(process.env.SALT))
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    user.password = hashPassword
    await user.save()
    await token.remove()

    res.status(200).send({ message: 'password reset successfully' })
  } catch (error) {
    res.status(500).send({ message: 'Internal server error!' })
  }
})

module.exports = router
