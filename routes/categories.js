const router = require('express').Router()
const Category = require('../model/Category')

router.post('/', async (req, res) => {
  const newCat = new Category(req.body)
  try {
    const savedCat = await newCat.save()
    res.status(200).send({ data: savedCat })
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
})

router.get('/', async (req, res) => {
  try {
    const cats = await Category.find()
    res.status(200).send({ data: cats })
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
})

module.exports = router
