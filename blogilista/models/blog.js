
const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
  url: String,
  title: String,  
  author: String,
  likes: {
    type: Number,
    default: 0   //required for 4.11, tried adding required for title and url for 4.12 either but gives 500 error.
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})


blogSchema.set('toJSON', { //make _id into id when being used.
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})


module.exports = mongoose.model('Blog', blogSchema)
