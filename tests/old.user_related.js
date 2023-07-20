const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  await User.insertMany(helper.initialUsers)
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
