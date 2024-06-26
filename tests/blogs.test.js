const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Blog = require('../models/Blog');
let token;

describe('Blog API', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const user = await new User({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      password: 'password'
    }).save();

    const res = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'john.doe@example.com',
        password: 'password'
      });
    token = res.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Blog.deleteMany({});
  });

  it('should create a blog', async () => {
    const res = await request(app)
      .post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'My First Blog',
        description: 'This is a test blog',
        tags: ['test', 'blog'],
        body: 'This is the content of the blog'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('title', 'My First Blog');
  });

  it('should fetch all published blogs', async () => {
    await new Blog({
      title: 'My First Blog',
      description: 'This is a test blog',
      author: mongoose.Types.ObjectId(),
      state: 'published',
      tags: ['test', 'blog'],
      body: 'This is the content of the blog'
    }).save();

    const res = await request(app).get('/api/blogs');
    expect(res.statusCode).toEqual(200);
    expect(res.body.blogs).toHaveLength(1);
  });

  it('should fetch a single published blog and increment read count', async () => {
    const blog = await new Blog({
      title: 'My First Blog',
      description: 'This is a test blog',
      author: mongoose.Types.ObjectId(),
      state: 'published',
      tags: ['test', 'blog'],
      body: 'This is the content of the blog'
    }).save();

    const res = await request(app).get(`/api/blogs/${blog._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title', 'My First Blog');
    expect(res.body.read_count).toBe(1);
  });

  it('should allow the owner to update their blog', async () => {
    const blog = await new Blog({
      title: 'My First Blog',
      description: 'This is a test blog',
      author: mongoose.Types.ObjectId(),
      state: 'draft',
      tags: ['test', 'blog'],
      body: 'This is the content of the blog'
    }).save();

    const res = await request(app)
      .put(`/api/blogs/${blog._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Updated Blog',
        state: 'published'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('title', 'Updated Blog');
    expect(res.body).toHaveProperty('state', 'published');
  });

  it('should allow the owner to delete their blog', async () => {
    const blog = await new Blog({
      title: 'My First Blog',
      description: 'This is a test blog',
      author: mongoose.Types.ObjectId(),
      state: 'draft',
      tags: ['test', 'blog'],
      body: 'This is the content of the blog'
    }).save();

    const res = await request(app)
      .delete(`/api/blogs/${blog._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Blog deleted');
  });
});
