const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../../utils/list_helper')


describe('most liked', () => {
const blogs = require('../../utils/data')

  test('the test with the most blogs', () => {
    const result = listHelper.favoriteBlog(blogs) //gets biggest here
    assert.deepStrictEqual(result, {
            _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
    })
  })
})