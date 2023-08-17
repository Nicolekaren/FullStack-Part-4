const { blogsInDb } = require("../tests/test_helper")

const dummy = (blogs) => {
    return 1
  }
  

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => total + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
    return blogs.reduce((prev, curr) => {
       if (prev.likes > curr.likes)
            return prev
        else
            return curr
    }, 0)
}

const mostBlogs = (blogs) => {
  const blogTotal = blogs.reduce((sum, blog) => {
    const author = blog.author
    sum[author] = (sum[author] || 0) + 1
    return sum
  }, {})

  let topAuthor = ''
  let mostBlogs = 0

  for ( author in blogTotal) {
    if (blogTotal[author] > mostBlogs) {
      topAuthor = author
      mostBlogs = blogTotal[author]
    }
  }

  return {
    author: topAuthor,
    blogs: mostBlogs,
  }
}

function mostLikes(blogs) {
  const authorLikes = blogs.reduce((sum, blog) => {
    const author = blog.author
    sum[author] = (sum[author] || 0) + blog.likes
    return sum 
  }, {})

  let topAuthor = ''
  let mostLikes = 0

  for (author in authorLikes) {
    if (authorLikes[author] > mostLikes) {
      topAuthor = author
      mostLikes = authorLikes[author]
    }
  }

  return {
    author: topAuthor,
    likes: mostLikes,
  }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
  }