const express = require('express');
const { getAllBlogs, getBlog, createBlog, updateBlog, deleteBlog, getUserBlogs } = require('../controllers/blogController');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', getAllBlogs);
router.get('/:id', getBlog);
router.post('/', auth, createBlog);
router.put('/:id', auth, updateBlog);
router.delete('/:id', auth, deleteBlog);
router.get('/user', auth, getUserBlogs);

module.exports = router;
