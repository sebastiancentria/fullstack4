//tests that do the very old test files at the start of part 4

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => {
    return sum + blog.likes
  }, 0) //0 is the initial value required here!
}

const favoriteBlog = (blogs) => {

  return blogs.reduce((favorite, blog) => {
    return blog.likes > favorite.likes ? blog : favorite
  }, blogs[0]) //initial value here aswell otherwise doesnt work
}


//commenting to understand, might remake once start using Lodash.
const mostBlogs = (blogs) => {
  const counts = {} //counter object

  blogs.forEach(blog => { //loops through all the blogs in data.js, if author already exists adds the value they have and adds +1, if not starts from 0 and adds 1 to it, filling Counts with the authors and eventually their full numbers
    counts[blog.author] = (counts[blog.author] || 0) + 1
  })
  console.log(counts) //just here so I can see what it looks like

  let topAuthor = null
  let maxBlogs = 0

  for (const author in counts) {
    if (counts[author] > maxBlogs) { //This actually loops through the now fully filled "counts" to replace the maxblogs and top author with whoever had the most numbers.
      maxBlogs = counts[author]
      topAuthor = author
    }
  }

  return { //then returns them
    author: topAuthor,
    blogs: maxBlogs
  }
}



const mostLikes = (blogs) => {
  const count = {}

  blogs.forEach(blog => { //this makes a count for each author aswell, but checks each of their blogs and adds the likes to it (starting from 0, if its the first one)
    count[blog.author] = 
    (count[blog.author] || 0) + blog.likes
  })
  console.log(count) //just here so I can see what it looks like

  let topAuthor = null
  let highestLikes = 0

  for (const author in count) {
    if (count[author] > highestLikes) { //loops through the filled counts and sets the highest likes they have.
      highestLikes = count[author]
      topAuthor = author
    }
  }

  return { //returns them
    author: topAuthor,
    likes: highestLikes
  }


}


module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}


