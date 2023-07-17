const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const config = require('../utils/config')


blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {'username': 1, 'name': 1})
  response.json(blogs)

})

blogsRouter.get('/:id', async (request, response)=> {
  const blog = await Blog.findById(request.params.id)
  response.json(blog)
})


blogsRouter.post('/', async (request, response) => {
  const user = request.user
  const blog = new Blog(request.body)
  // const user = await User.findById(request.body.userId)
  // const user = await User.findOne()

  blog.user = user._id
  // console.log(blog)

  try {
    let savedBlogEntry = await blog.save()
    response.status(201).json(savedBlogEntry)
    user.blogs = user.blogs.concat(savedBlogEntry._id)
    await user.save()
  } catch (error) {
    response.status(400).end()
  }



})

blogsRouter.delete('/:id', async (request, response) => {
  const user = request.user

  const blog = await Blog.findById(request.params.id)

  if (blog.user.id.toString() !== user.id.toString() ) {
    response.status(401).json({Error: 'Unauthorized, invalid token'})
  } else {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  let updatedBlog = await {
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes
  }

  let modified = await Blog.findByIdAndUpdate(request.params.id, updatedBlog, {new: true})
  response.status(200).json(modified)
})

module.exports = blogsRouter