const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const { tokenExtractor, requestLogger, userExtractor} = require('../utils/middleware')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  if (!body.title) {
    return response.status(400).json({ error: 'Title not found' })
  }

  if (!body.url) {
    return response.status(400).json({ error: 'URL not found' })
  }

  try {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'Token invalid' })
    }
    const user = await User.findById(decodedToken.id)
    if (!user) {
      return response.status(401).json({ error: 'User not found' })
    }
    const newBlog = new Blog({
      title: body.title,
      author: body.author || '',
      url: body.url,
      likes: body.likes || 0, 
      user: user._id, 
    })
    const savedBlog = await newBlog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save();
    response.status(201).json(savedBlog.toJSON())

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return response.status(400).json({ error: 'Invalid token' })
    }
    return response.status(500).json({ error: 'Server error' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body
  
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      id: request.params.id 
    }
    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    if (updatedBlog) {
        response.json(updatedBlog)
    } 
    else {
        return response.status(404).end()
    }
})

blogsRouter.delete('/:id', async (request, response) => {
  const token = request.token
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)
  const blogId = request.params.id
  const blog = await Blog.findById(blogId)

  if (user.id.toString() === blog.user.toString()) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  }
  else {
    return response.status(401).json({ error: 'user is invalid' })
  }
})

module.exports = blogsRouter
