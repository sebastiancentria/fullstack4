const app = require("./app")
const config = require('./utils/config')
const mongoose = require('mongoose')

const Blog = require('./models/blog')
const User = require('./models/user')

mongoose.connect(process.env.TEST_MONGODB_URI)

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})