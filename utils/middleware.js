const config = require('../utils/config')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const modifyAuthHeader = (request, response, next) => {
    // console.log(request)
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer')) {
      request.token = authorization.replace('Bearer ', '')
      next()
    } else {
      next()
    }
  }

const userExtractor = async (request, response, next) => {
  const authorization = request.token
  if (authorization) {
  const isTokenValid = jwt.verify(authorization, config.SECRET)
    // console.log(isTokenValid)
    if (!isTokenValid.id) {
      return response.status(401).json({Error: 'Valid token required'}).end()
    }
  request.user = await User.findById(isTokenValid.id)
  }
  next()
  ///4.21-23

}

module.exports = {modifyAuthHeader, userExtractor}