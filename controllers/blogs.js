const blogsRouter = require('express').Router()
const { response } = require('../app')
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)

})

blogsRouter.get('/:id', async (request, response)=> {
  const blog = await Blog.findById(request.params.id)
  response.json(blog)
})

blogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)

  try {
    let savedBlogEntry = await blog.save()
    response.status(201).json(savedBlogEntry)
  } catch (error) {
    response.status(400).end()
  }

})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
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