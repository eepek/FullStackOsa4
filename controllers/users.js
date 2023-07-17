const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', {'url': 1, 'title': 1, 'author': 1})
    response.json(users)
})


usersRouter.post('/', async (request, response, next) => {
    const {username, name, password} = request.body

    //Testataan että käyttäjätunnus ja salasana täyttävät ehdot

    if(!username || !password || username.length < 3 || password.length < 3) {
        response.status(400).send('Username and password must be at least 3 characters long')
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash
    })

    try {
        const savedUser = await user.save()
        response.status(201).json(savedUser)
    } catch(error) {

        next(error)
    }
})

const errorHandler = (error, request, response, next) => {
    // console.log(error.name)
    if (error.name === 'ValidationError') {
        response.status(400).send('Username already exists')
    }
}

usersRouter.use(errorHandler)

module.exports = usersRouter