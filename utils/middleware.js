const logger = require('./logger')
const jwt = require("jsonwebtoken")
const User = require("../models/user")

/*const requestLogger = (request, response, next) => {
     logger.info('Method:', request.method)
     logger.info('Path:  ', request.path)
     logger.info('Body:  ', request.body)
     logger.info('---')
    next()
  }*/

const tokenExtractor = (request, response, next) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    request.token = authorization.substring(7)
  }
  else{
    request.token = null
  }
  next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
  

const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return response.status(400).send({ error: 'malformatted id' })
    }
    else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
   else if (error.name ===  'JsonWebTokenError') {
    return response.status(400).json({ error: error.message })
    }
    next(error)
}
const userExtractor = (request, response, next) => {
  const authorizationHeader = request.get('Authorization')

  if (authorizationHeader && authorizationHeader.toLowerCase().startsWith('bearer ')) {
      const token = authorizationHeader.split(' ')[1]

      try {
          const decodedToken = jwt.verify(token, process.env.SECRET)
          request.user = decodedToken
      } catch (error) {
      }
  }

  next()
}







module.exports = {
    //requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
  }