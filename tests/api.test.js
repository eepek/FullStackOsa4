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

describe('Fetch from and add to DB tests', () => {

  test('all blogs are returned', async () => {
    const resp = await helper.blogsInDB()

    expect(resp).toHaveLength(helper.initialBlogs.length)
  })

  test('id field is correctly named', async () => {
    let resp = await helper.blogsInDB()
    //Käydään läpi kaikki blogit mapilla
    resp.map(entry => expect(entry.id).toBeDefined)
  })

  test('blog post can be added to DB', async () => {
    let newEntry = {
      title: "Test Blog Entry",
      author: "Testy McTester",
      url: "www.testblog.blog.test.blog",
      likes: 1
    }

    await api
      .post("/api/blogs")
      .send(newEntry)
      .expect(201)

    let allNotes = await helper.blogsInDB()
    //Testataan että databeississä on yksi blogi enemmän kuin alkuperäisissä
    expect(allNotes).toHaveLength(helper.initialBlogs.length + 1)
    //Testataan että oikea blogi on lisätty
    let titles = allNotes.map(blog => blog.title)
    expect(titles).toContain('Test Blog Entry')
  })

  test('blog with no likes defined gets 0 likes', async () => {
    let newEntry = {
      title: "Test Blog Entry",
      author: "Testy McTester",
      url: "www.testblog.blog.test.blog"
    }

    await api
      .post("/api/blogs")
      .send(newEntry)
      .expect(201)

    let fetchedNotes = await helper.blogsInDB()

    let entryFromDB = fetchedNotes.filter(blog => blog.author === "Testy McTester")

    expect(entryFromDB[0].likes).toBe(0)
  })

  test('blog with no title gets 400', async () => {
    let newEntry = {
      author: "Testy McTester",
      url: "www.testblog.blog.test.blog"
    }

    await api
    .post("/api/blogs")
    .send(newEntry)
    .expect(400)
  })

  test('blog with no url gets 400', async () => {
    let newEntry = {
      title: "Test Blog",
      author: "Testy McTester",
      likes: 10
    }

    await api
    .post("/api/blogs")
    .send(newEntry)
    .expect(400)
  })
})

describe('Deleting and modifying the db tests', () => {
  test('Deleting post gives status 204', async () => {
    let blogs = await helper.blogsInDB()
    let toBeDeleted = blogs[0]

    await api.delete(`/api/blogs/${toBeDeleted.id}`).expect(204)
  })

  test('Modifying post returns 200 and blog is modified', async () => {
    const newEntery = {
      title: 'title',
      author: 'new Author',
      url: 'new.url',
      likes: 10
    }

    let blogs = await helper.blogsInDB()
    let toBeModifiedId = blogs[0].id

    //Tarkistetaan että saadaan status 200
    let modified = await api.put(`/api/blogs/${toBeModifiedId}`).send(newEntery).expect(200)
    delete modified.body.id
    //tarkistetaan että palautetun blogin sisältö on sama kuin lähetetty
    expect(modified.body).toEqual(newEntery)
    //haetaan blogit uudelleen db:stä ja tarkistetaan että pituus on edelleen sama
    let updatedBlogs = await helper.blogsInDB()
    expect(updatedBlogs).toHaveLength(helper.initialBlogs.length)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})