const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

const userAddedBlogPost = async () => {
  let logintToken = ""
  let userId = ""
  //Add a testuser and get id and token for them
  //Id
  const login = await api
    .post('/api/users')
    .send({
      "username": "apowers",
      "name": "Austin Powers",
      "password": "groovy"
    })

  userId = login.body.id
  //token
  const token = await api
    .post('/api/login')
    .send({
    "username": "apowers",
    "password": "groovy"
    })
  logintToken = token.body.token

  let testEntry = {
    title: "Test Blog Entry",
    author: "Testy McTester",
    url: "www.testblog.blog.test.blog",
    likes: 1,
    user: userId
  }

  return {userId, logintToken, testEntry}
}

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
  await User.deleteMany({})
  await User.insertMany(helper.initialUsers)

})

describe('Fetch from and add to DB tests', () => {

  test('all blogs are returned', async () => {
    const resp = await helper.blogsInDB()
    //console.log(resp)
    expect(resp).toHaveLength(helper.initialBlogs.length)
  })

  test('id field is correctly named', async () => {
    let resp = await helper.blogsInDB()
    //Käydään läpi kaikki blogit mapilla
    resp.map(entry => expect(entry.id).toBeDefined)
  })



  test('blog post can be added to DB', async () => {
    const {logintToken, testEntry} = await userAddedBlogPost()

    await api
      .post("/api/blogs")
      .set('Authorization', `Bearer ${logintToken}`)
      .send(testEntry)
      // .expect(({headers}) => {
      //   console.log(headers)
      // })
      .expect(201)

    let allNotes = await helper.blogsInDB()
    //Testataan että databeississä on yksi blogi enemmän kuin alkuperäisissä
    expect(allNotes).toHaveLength(helper.initialBlogs.length + 1)
    //Testataan että oikea blogi on lisätty
    let titles = allNotes.map(blog => blog.title)
    expect(titles).toContain('Test Blog Entry')
  })


  //SAMA KORJAUS KUIN YLLÄ
  test('blog with no likes defined gets 0 likes', async () => {
    const {logintToken, testEntry} = await userAddedBlogPost()
    delete testEntry.likes
    await api
      .post("/api/blogs")
      .set('Authorization', `Bearer ${logintToken}`)
      .send(testEntry)
      .expect(201)

    let fetchedNotes = await helper.blogsInDB()

    let entryFromDB = fetchedNotes.filter(blog => blog.author === "Testy McTester")

    expect(entryFromDB[0].likes).toBe(0)
  })

  //KORJAA
  test('blog with no title gets 400', async () => {
    const {logintToken, testEntry} = await userAddedBlogPost()
    delete testEntry.title
    await api
      .post("/api/blogs")
      .set('Authorization', `Bearer ${logintToken}`)
      .send(testEntry)
    .expect(400)
  })

  test('blog with no url gets 400', async () => {
    const {logintToken, testEntry} = await userAddedBlogPost()
    delete testEntry.url
    await api
      .post("/api/blogs")
      .set('Authorization', `Bearer ${logintToken}`)
      .send(testEntry)
    .expect(400)
  })
})

describe('Deleting and modifying the db tests', () => {
  test('Deleting post gives status 204', async () => {
    const {userId, logintToken, testEntry} = await userAddedBlogPost()
    let toBeDeleted = await api
      .post("/api/blogs")
      .set('Authorization', `Bearer ${logintToken}`)
      .send(testEntry)

    let blogId = toBeDeleted.body.id
    await api.delete(`/api/blogs/${blogId}`).set('Authorization', `Bearer ${logintToken}`).expect(204)
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

describe('initially one user in the db', () => {

  test('new user can be added', async () => {
    const initialUsers = await helper.usersInDb()
    // console.log(initialUsers)
    const newUser = {
        username: 'apowers',
        name: 'Austin Powers',
        password: 'groovy'
    }

    await api
        .post('/api/users')
        .send(newUser)
        .expect(201)

    const usersAfter = await helper.usersInDb()
    // console.log(usersAfter)
    expect(usersAfter).toHaveLength(initialUsers.length + 1)
  })

  test('user with existing username gives error', async () => {
    const rejectedUser = {
      username: 'drevil',
      name: 'not real Dr. Evil',
      password: 'longenoughpassword'
    }

    let initialUsers = await helper.usersInDb()
    // initialUsers = initialUsers.map(u => u.username)
    // console.log(initialUsers)

    await api
      .post('/api/users')
      .send(rejectedUser)
      .expect(400)

    let afterUsers = await helper.usersInDb()

    expect(afterUsers).toHaveLength(initialUsers.length)

    afterUsers = afterUsers.map(u => u.username)
    expect(afterUsers).toContain(rejectedUser.username)

  })

  test('short username and password are rejected', async () => {
    const shortUsername = {
      username: 'a',
      name: 'Is A Name',
      password: 'Long enough password'
    }

    const shortPasswords = {
      username: 'longenough',
      name: 'Is A Name',
      password: 'x'
    }
    //Lyhyt käyttäjänänimi
    await api
      .post('/api/users')
      .send(shortUsername)
      .expect(400)
    //Lyhyt salasana
    await api
      .post('/api/users')
      .send(shortPasswords)
      .expect(400)
    //Sitten vielä molemmat
    shortUsername.password = 'y'
    await api
      .post('/api/users')
      .send(shortUsername)
      .expect(400)

    const users = await helper.usersInDb()

    expect(users).toHaveLength(helper.initialUsers.length)
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})