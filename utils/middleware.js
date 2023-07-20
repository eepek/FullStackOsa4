const config = require('../utils/config')
const jwt = require('jsonwebtoken')
const User = require('../models/user')


const modifyAuthHeader = (request, response, next) => {
    //console.log('modifyAuthHeader', request.method)

    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer')) {
      //console.log('token löytyi')
      request.token = authorization.replace('Bearer ', '')
      next()
    } else {

    //console.log('ei tokenia')
    next()
    }
  }

const userExtractor = async (request, response, next) => {
  //console.log('userExtractor', request.method)
  const authorization = await request.token
  let isTokenValid = false
  try {
    isTokenValid = jwt.verify(authorization, config.SECRET)
  } catch(error) {
    //console.log('ei validi token', error)
    next()
  }
  if (isTokenValid) {
    //console.log('token validi, käyttäjä on:')
    //console.log(isTokenValid.id)

    request.user = await User.findById(isTokenValid.id.toString())
    next()
  }
}

module.exports = {modifyAuthHeader, userExtractor}