const jwt = require('jsonwebtoken')
const User = require('../models/user')

const tokenExtractor = (request, response, next) => { 
  const authorization = request.get('authorization')

  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  } else {
    request.token = null
  }

  next()
}


const userExtractor = async (request, response, next) => {
  if (!request.token) { //here so it doesnt crash if you try the test which has no token.
    return response.status(401).json({ error: 'token missing' })
  }

  const decodedToken = jwt.verify(request.token, process.env.SECRET)

  if (!decodedToken.id) {
    return response.status(401).json({
      error: 'token invalid'
    })
  }

  request.user = await User.findById(decodedToken.id) //finds the user by the token

  next()
}

module.exports = {
  tokenExtractor,
  userExtractor
}