const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)



beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)

})

test('all blogs are returned', async () => {
  const resp = await api.get('/api/blogs')

  expect(resp.body).toHaveLength(initialBlogs.length)
})

test('id field is correctly named', async () => {
  const resp = await helper.blogsInDB()
  console.log(resp)
})


afterAll(async () => {
  await mongoose.connection.close()
})