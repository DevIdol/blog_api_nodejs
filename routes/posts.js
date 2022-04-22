const router = require('express').Router()
const Post = require('../model/Post')

//CREATE POST
router.post('/', async (req, res) => {
  const newPost = new Post(req.body)
  try {
    const savedPost = await newPost.save()
    res.status(200).send({ data: savedPost })
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
})

//UPDATE POST
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (post.username === req.body.username) {
      try {
        const updatedPost = await Post.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true },
        )
        res.status(200).send({ data: updatedPost })
      } catch (err) {
        res.status(500).send({ message: 'Internal Server Error' })
      }
    } else {
      res.status(401).send({ message: 'You can update only your post!' })
    }
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
})

//DELETE POST
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (post.username === req.body.username) {
      try {
        await post.delete()
        res.status(200).send({ message: 'Post has been deleted!' })
      } catch (err) {
        res.status(500).send({ message: 'Internal Server Error' })
      }
    } else {
      res.status(401).send({ message: 'You can delete only your post!' })
    }
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
})

//GET POST
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    res.status(200).send({ data: post })
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
})

//GET ALL POSTS
router.get('/', async (req, res) => {
  const username = req.query.user
  const catName = req.query.cat
  try {
    let posts
    if (username) {
      posts = await Post.find({ username })
    } else if (catName) {
      posts = await Post.find({
        categories: {
          $in: [catName],
        },
      })
    } else {
      posts = await Post.find()
    }
    res.status(200).send({data: posts})
  } catch (err) {
    res.status(500).send({ message: 'Internal Server Error' })
  }
})

module.exports = router
