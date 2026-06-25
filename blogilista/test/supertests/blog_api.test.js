
/*
node --test test/supertests/blog_api.test.js
*/

const { test, before, beforeEach, after } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest') //allows to make HTTP requests without having a server on
require('dotenv').config()
const assert = require('node:assert')
const app = require('../../app')
const api = supertest(app) //makes the app.js able to do http stuff ^
const initialBlogs = require('../../utils/data')
const Blog = require('../../models/blog')
const User = require('../../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const login = async () => { //a log in to get the token for these tests
  const response = await api
    .post('/api/login')
    .send({
      username: 'root', 
      password: 'sekret'
    })

  return response.body.token
}

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
  
  user.blogs = savedBlogs.map(b => b._id) //required to make blogs work in user.
  await user.save()
})

test('blogs are returned as json', async () => { //TEST NUMBER 1
  const response = await api 
    .get('/api/blogs') //http request to api/blogs
    .expect(200) //check that status is 200 on HTTP
    .expect('Content-Type', /application\/json/)  //make sure its JSON 

  const blogs = response.body //array of wahts inside the blogs

  assert.strictEqual(blogs.length, 6)  //checks if the current blog amount is infact 6.
})




test('blogs have id field', async () => { //TEST NUMBER 2
  const response = await api.get('/api/blogs')

  const blogs = response.body

  blogs.forEach(blog => {
    assert.ok(blog.id) //checks if the value is truthful
  })
})


test('a valid blog can be added', async () => { //adds a new blog (which is ofc deleted at the start of the file, but this serves as the 7th. (it is NOT added to data.js)
  const token = await login() //uses the login at the top of the file to get a token (currently with a set user since its just a test.)

  const newBlog = {
    title: 'A new story',
    author: 'Mr.new',
    url: 'https://newbeginnings.com',
    likes: 102,
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`) //sets the authorization as Bearer (and then the token) 
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await api.get('/api/blogs')

  assert.strictEqual(blogsAtEnd.body.length, initialBlogs.length + 1) //checks in the test that it has been increased. Its also visible in the mongo database so it does infact work.
})


test('no likes become 0', async () => { //checks if the new blog is 0 and with changed logic in the schema it can be done.
 
const token = await login() 
  const newBlog = {
    title: 'The unlikeable',
    author: 'Unlikeable man',
    url: 'https://hate.com',
    __v: 0
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`) //sets the authorization as Bearer (and then the token) 
    .send(newBlog)
    .expect(201)

  assert.strictEqual(response.body.likes, 0) //makes the body likes strictly equal to 0.
})



test('missing title or url', async () => { //test PASSES if the blog added doesnt have title or an url.
  
  const token = await login() 
  const blogWithoutTitle = {
    author: 'Tester',
    url: 'https://example.com',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`) //sets the authorization as Bearer (and then the token) 
    .send(blogWithoutTitle)
    .expect(400)
})


test('a blog can be deleted from the base', async () => {
  const token = await login()
  const blogsAtStart = await api.get('/api/blogs')
  const blogToDelete = blogsAtStart.body[0] //gets the first one so "React patterns" atm in data.js

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await api.get('/api/blogs')

  assert.strictEqual(blogsAtEnd.body.length, blogsAtStart.body.length - 1) //checks if the changed blog amount is now shorter, proving it works.
})


test('a blog can be updated from the base', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blog = blogsAtStart.body[0] //gets the first one so "React patterns" atm in data.js which atm has 7 likes.

  const updatedBlog = {
  title: blog.title,
  author: blog.author,
  url: blog.url,
  likes: blog.likes + 1,
  user: blog.user.id 
  }

  const response = await api
    .put(`/api/blogs/${blog.id}`) //uses the put in app.js request.
    .send(updatedBlog)
    .expect(200)

  assert.strictEqual(response.body.likes, blog.likes + 1) //checks if the selected blog has +1 like.
})


test('blogs contain user info', async () => {
  const response = await api.get('/api/blogs')

  const blogs = response.body

  blogs.forEach(blog => {
    assert.ok(blog.user)      // user exists
    assert.ok(blog.user.id)   // populated correctly
  })
})

test('blog required token', async () => {
  const newBlog = {
    title: 'No blog',
    author: 'infiltrator',
    url: 'trolling.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
})

after(async () => { //closes the mongodb connection, and then the rest of the tests run, as usual.
  await mongoose.connection.close()
})

