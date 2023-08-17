const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const api = supertest(app)
const Blog = require('../models/blog')
const helper = require('./test_helper')


beforeEach(async () => {
    await Blog.deleteMany({})
    const Blogs = helper.initialBlogs.map(blog => new Blog(blog))
    const promiseArray = Blogs.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

test("all blogs are returned and in json format", async () => {
    await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
	  expect(response.body.length).toBe(helper.initialBlogs.length)
})

test('unique identifier property of a blog is named id', async () => {
    const response = await api.get('/api/blogs')
    for (let blog of response.body) {
      expect(blog.id).toBeDefined()
    }
})

test('creating and posting a new blog', async () => {
  const login = {
    "username": "Nicole11",
    "name": "nicole"
  }

  const user = await api
    .post('/api/login')
    .send(login)
    .expect(200)
    

    const newBlog = {
      title: 'New Blog Title',
      author: 'New Blog Author',
      url: 'https://example.com',
      likes: 10,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${user.token}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

  })
  

test('likes property', async () => {
  const responseBlogs = await api.get('/api/blogs')

  responseBlogs.body.forEach(async (blog) => {
    if (blog.likes === undefined) {
      blog.likes = 0
    }
  })
  responseBlogs.body.forEach(async (blog) => {
    await expect(blog.likes).toBeDefined()
  })
})

  test('with no title', async () => {
    const newBlog = {
      '_id': '5a422a851b54a676234d17f9',
      'author': 'Nisko L',
      'url': 'https://reactpatterns.com/',
      'likes': 100
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(helper.initialBlogs.length )
  })

  test('with no url', async () => {
    const newBlog = {
      '_id': '5a422a851b54a676234d17f9',
      'author': 'Nisko L',
      'likes': 100,
      '__v': 0
    }
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(helper.initialBlogs.length )
  })

  test('deletion of blog succeeds with status code 204', async () => {
    const blogAtStart = await helper.blogsInDb()
    const blogToDelete = blogAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )
    const authors = blogsAtEnd.map(r => r.author)
    expect(authors).not.toContain(blogToDelete.author)
})

  describe('when there is initially one user in db', () => {
    beforeEach(async () => {
      await User.deleteMany({})
  
      const passwordHash = await bcrypt.hash('sekret', 10)
      const user = new User({ username: 'root', passwordHash })
  
      await user.save()
    })
  
    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'amyPond',
        name: 'amy',
        password: 'test',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })
  })

  test('updating the likes of a blog', async () => {
    const blogAtStart = helper.initialBlogs[0];
    const updatedLikes = blogAtStart.likes + 1
    
    const updatedBlog = { ...blogAtStart, likes: updatedLikes }
    
    const response = await api
      .put(`/api/blogs/${blogAtStart._id}`)
      .send(updatedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(updatedLikes)
  })



afterAll(async () => {
  await mongoose.connection.close()
})