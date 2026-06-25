const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../../utils/list_helper')


describe('total likes', () => {
 const blogs = require('../../utils/data')

  test('list has total blog as 36 fr', () => {
    const result = listHelper.totalLikes(blogs)
    const expectedlikes = 7 + 5 + 12 + 10 + 0 + 2 //prolly better than magical 36 
    assert.strictEqual(result, expectedlikes)
  })
})