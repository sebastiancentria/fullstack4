const express = require('express')
const Blog = require("./models/blog") //requires blog
const User = require("./models/user") 
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
require('dotenv').config() //for secret
const middleware = require('./utils/middleware')

const app = express()

app.use(express.json())
app.use(middleware.tokenExtractor)


//-------------------------------------------------
//BLOG RELATED REQUESTS----------------------------
//-------------------------------------------------
app.get('/api/blogs', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { //populates user with the data 
  username: 1,
  name: 1,
  id: 1 })
  response.json(blogs)
})

app.post('/api/blogs', middleware.userExtractor, async (request, response) => {
  const body = request.body

  const user = request.user //from middleware 

  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'title or url missing' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes ?? 0,
    user: user._id, //blog is owned by the logged in user!
  })

  const savedBlog = await blog.save()

  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201).json(savedBlog)
})


app.delete('/api/blogs/:id', middleware.userExtractor, async (request, response, next) => {

  const user = request.user //from middleware 
  const blog = await Blog.findById(request.params.id)

  if (blog.user.toString() !== user.id.toString()) {
  return response.status(403).json({
    error: 'only creator can delete blog'
  })
}

  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.put('/api/blogs/:id', async (request, response, next) => {
  try {
    const { title, author, url, likes, user } = request.body

    const updatedBlog = await Blog.findByIdAndUpdate( //apparently "findByIdAndUpdate" depricated when using cmd but it works :D
      request.params.id,
      { title, author, url, likes, user },
      { new: true, runValidators: true }
    )

    if (!updatedBlog) {
      return response.status(404).end()
    }

    response.json(updatedBlog)
  } catch (error) { next(error) }
})

//-------------------------------------------------
//USER RELATED REQUESTS----------------------------
//-------------------------------------------------
app.get('/api/users', async (request, response) => {
  const users = await User.find({}).populate('blogs', { 
  url: 1,
  title: 1,
  author: 1,
  id: 1 }).select('username name blogs')  //here so passwordhash doesnt join the user data.
  response.json(users)
})


app.post('/api/users', async (request, response) => {
  const { username, name, password } = request.body

  if (!username || !password) {
    return response.status(400).json({ error: 'username or password missing' })
  }

  if (password.length < 3 || username.length < 3) { //before the hash
    return response.status(400).json({ error: 'password and username must be at least 3 characters' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()
  response.status(201).json(savedUser)
})


//-------------------------------------------------
//LOGIN--------------------------------------------
//-------------------------------------------------
app.post('/api/login', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username }) //looks for user in the db

  const passwordCorrect = 
    user === null
      ? false
      : await bcrypt.compare(password, user.passwordHash) //compares with bcrypt the password

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password',
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET) //creates token for user if everything is correct

  response.status(200).send({ //response includes the token
    token,
    username: user.username,
    name: user.name,
  })
})


module.exports = app //Exports app