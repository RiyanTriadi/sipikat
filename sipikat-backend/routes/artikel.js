// routes/artikel.js
const express = require('express');
const router = express.Router();
const artikelController = require('../controllers/artikelController');
const authenticateToken = require('../middleware/auth');

router.get('/', artikelController.getAllArticles); 
router.get('/:slug', artikelController.getArticleBySlug); 
router.post('/', authenticateToken, artikelController.addArticle); 
router.put('/:id', authenticateToken, artikelController.updateArticle); 
router.delete('/:id', authenticateToken, artikelController.deleteArticle); 

module.exports = router;