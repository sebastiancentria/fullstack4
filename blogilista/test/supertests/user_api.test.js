
/*
node --test test/supertests/user_api.test.js
*/

const { test, before, beforeEach, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest') //allows to make HTTP requests without having a server on
const assert = require('node:assert')
const app = require('../../app')
const api = supertest(app) //makes the app.js able to do http stuff ^
const User = require('../../models/user')
const initialBlogs = require('../../utils/data')
const Blog = require('../../models/blog')
const bcrypt = require('bcrypt')

require('dotenv').config()

before(async () => { //runs before the other tests, and connects to database
  console.log('connecting...') 
  await mongoose.connect(process.env.TEST_MONGODB_URI)
  console.log('connected!')
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

const passwordHash = await bcrypt.hash('sekret', 10)

  const user = new User({
    username: 'root',
    name: 'Superuser',
    passwordHash
  })

  const savedUser = await user.save()

  const blogsWithUser = initialBlogs.map(blog => ({
    ...blog,
    user: savedUser.id
  }))

  const savedBlogs = await Blog.insertMany(blogsWithUser)

user.blogs = savedBlogs.map(b => b._id)
await user.save()
})




test('an user can be added', async () => { //adds a new blog (which is ofc deleted at the start of the file, but this serves as the 7th. (it is NOT added to data.js)
  const newUser = {
    username: 'Jackie',
    name: 'Jack Morgan',
    password: 'basepasswordtest'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const usersAtEnd = await api.get('/api/users')

  assert.strictEqual(usersAtEnd.body.length, 2)
})


test('a rulebreaker cannot be added!', async () => { 
  const newUser = {
    username: 'Valerie',
    name: 'Jack Morgan',
    password: 'ba'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(400)

  const usersAtEnd = await api.get('/api/users')

  assert.strictEqual(usersAtEnd.body.length, 1)
})



after(async () => { 
  await mongoose.connection.close()
})
