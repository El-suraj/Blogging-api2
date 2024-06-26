const Blog = require('../models/Blog');
const logger = require('../utils/logger');

exports.getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, author, tags, sortBy } = req.query;
    const query = { state: 'published' };

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    if (author) {
      query.author = author;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const sortOptions = {};
    if (sortBy) {
      sortBy.split(',').forEach(sortField => {
        sortOptions[sortField] = -1; // -1 for descending
      });
    }

    const blogs = await Blog.find(query)
      .populate('author', 'first_name last_name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions)
      .exec();

    const count = await Blog.countDocuments(query);
    
    res.json({
      blogs,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });

    logger.info('Fetched all blogs');
  } catch (error) {
    res.status(400).json({ error: error.message });
    logger.error('Error fetching blogs', { error: error.message });
  }
};

exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'first_name last_name email');
    if (!blog || blog.state !== 'published') {
      return res.status(404).json({ error: 'Blog not found' });
    }
    blog.read_count += 1;
    await blog.save();
    res.json(blog);
    logger.info('Fetched single blog', { blogId: req.params.id });
  } catch (error) {
    res.status(400).json({ error: error.message });
    logger.error('Error fetching blog', { error: error.message });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title, description, tags, body } = req.body;
    const blog = new Blog({
      title,
      description,
      author: req.user._id,
      tags,
      body
    });
    await blog.save();
    res.status(201).json(blog);
    logger.info('Blog created', { blogId: blog._id, author: req.user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
    logger.error('Error creating blog', { error: error.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog || blog.author.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Blog not found or unauthorized' });
    }
    const updates = req.body;
    Object.assign(blog, updates);
    await blog.save();
    res.json(blog);
    logger.info('Blog updated', { blogId: id, author: req.user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
    logger.error('Error updating blog', { error: error.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);
    if (!blog || blog.author.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Blog not found or unauthorized' });
    }
    await blog.remove();
    res.json({ message: 'Blog deleted' });
    logger.info('Blog deleted', { blogId: id, author: req.user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
    logger.error('Error deleting blog', { error: error.message });
  }
};

exports.getUserBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, state } = req.query;
    const query = { author: req.user._id };
    if (state) {
      query.state = state;
    }
    const blogs = await Blog.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await Blog.countDocuments(query);
    res.json({
      blogs,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
    logger.info('Fetched user blogs', { userId: req.user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
    logger.error('Error fetching user blogs', { error: error.message });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, author, tags, sortBy } = req.query;
    const query = { state: 'published' };

    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { body: new RegExp(search, 'i') }
      ];
    }

    if (author) {
      const user = await User.findOne({ email: author });
      if (user) query.author = user._id;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const sortOptions = {};
    if (sortBy) {
      sortBy.split(',').forEach(sortField => {
        sortOptions[sortField] = -1; // -1 for descending
      });
    }

    const blogs = await Blog.find(query)
      .populate('author', 'first_name last_name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(sortOptions)
      .exec();

    const count = await Blog.countDocuments(query);

    res.json({
      blogs,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page, 10)
    });

    logger.info('Fetched all blogs');
  } catch (error) {
    res.status(400).json({ error: error.message });
    logger.error('Error fetching blogs', { error: error.message });
  }
};

