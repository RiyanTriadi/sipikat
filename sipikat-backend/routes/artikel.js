const express = require('express');
const router = express.Router();
const artikelController = require('../controllers/artikelController');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', artikelController.getAllArticles); 
router.get('/:slug', artikelController.getArticleBySlug); 

// Admin routes - require authentication
router.post('/', authenticateToken, artikelController.addArticle); 
router.put('/:id', authenticateToken, artikelController.updateArticle); 
router.delete('/:id', authenticateToken, artikelController.deleteArticle); 

module.exports = router;