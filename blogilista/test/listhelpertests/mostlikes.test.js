const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../../utils/list_helper')

describe('most likes total author', () => {
    const blogs = require('../../utils/data')


  test('author with most likes total', () => {
    const result = listHelper.mostLikes(blogs)
    const expected = 12 + 5
    assert.deepStrictEqual(result, {
    author: "Edsger W. Dijkstra",
    likes: expected,
    })
  })

})