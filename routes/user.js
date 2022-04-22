const { validate, User } = require('../model/User')
const router = require('express').Router()
const bcrypt = require('bcrypt')
const Token = require('../model/Token')
const SendEmail = require('../utils/SendEmail')
const Post = require('../model/Post')
const crypto = require('crypto')

//Register
router.post('/register', async (req, res) => {
  try {
    const { error } = validate(req.body)
    error && res.status(400).send({ message: error.details[0].message })

    let user =
      (await User.findOne({
        username: req.body.username,
      })) || User.findOne({ email: req.body.email })
    if (user.email === req.body.email) {
      return res.status(400).send({ message: 'Email is already exist!' })
    } else if (user.username === req.body.username) {
      res.status(400).send({ message: 'Username is already exist!' })
    } else {
      res.status(400).send({ message: 'Something is wrong!' })
    }
    const salt = await bcrypt.genSalt(Number(process.env.SALT))
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    user = await new User({
      ...req.body,
      password: hashPassword,
    }).save()

    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString('hex'),
    }).save()
    const url = `${process.env.BASE_URL}/users/${user._id}/verify/${token.token}`
    await SendEmail(user.email, `Verify Email`, url)
    res.status(201).send({
      data: user,
      message: 'Require to approve from admin to login',
    })
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
})

//Get Verify Email
router.get('/:id/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id })
    !user && res.status(400).send({ message: 'User Not Found!' })

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    })
    !token && res.status(400).send({ message: 'Token Not Found!' })

    await User.updateOne({ _id: user._id, verified: true })
    await Token.findByIdAndRemove(token._id)

    res.status(200).send({ message: 'Email verified successfully' })
  } catch (error) {
    res.status(500).send({ message: 'Internal Server Error!' })
  }
})

//UPDATE
router.put('/:id', async (req, res) => {
  if (req.body.userId === req.params.id) {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(Number(process.env.SALT))
      req.body.password = await bcrypt.hash(req.body.password, salt)
    }
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true },
      )
      res
        .status(200)
        .send({ data: updatedUser, message: 'you have updated successfully!' })
    } catch (err) {
      res.status(500).send({ message: `User Can't update ${err}` })
    }
  } else {
    res.status(401).send({ message: 'You can update only your account!' })
  }
})

//DELETE
router.delete('/:id', async (req, res) => {
  if (req.body.userId === req.params.id) {
    try {
      const user = await User.findById(req.params.id)
      try {
        await Post.deleteMany({ username: user.username })
        await User.findByIdAndDelete(req.params.id)
        res.status(200).send({ message: 'User has been deleted!' })
      } catch (err) {
        res.status(500).send({ message: 'Internal Server Error' })
        console.log(err)
      }
    } catch (err) {
      res.status(404).send({ message: 'User not found!' })
    }
  } else {
    res.status(401).send({ message: 'You can delete only your account!' })
  }
})

//GET USER
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    const { password, ...others } = user._doc
    res.status(200).send({ data: others })
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
})

module.exports = router
