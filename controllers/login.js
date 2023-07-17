const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')
const config = require('../utils/config')

loginRouter.post('/', async (request, response) => {
    // console.log(request)
    const { username, password } = request.body
    console.log(username)
    const user = await User.findOne({username})
    console.log(user)
    const isCorrectPassword = await bcrypt.compare(password, user.passwordHash)

    if (user && isCorrectPassword) {
        const userInfo = {
            username: user.username,
            id: user._id
        }
        const token = await jwt.sign(userInfo, config.SECRET)


        return response.status(200)
            .send({token, username: user.username, name: user.name})

    } else {
        return response.status(401).json({Error: 'Invalid username or password'})
    }

})

module.exports = loginRouter