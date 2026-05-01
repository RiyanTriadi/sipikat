const express = require('express');
const router = express.Router();
const gejalaController = require('../controllers/gejalaController');
const { authenticateToken } = require('../middleware/auth'); 
const { noStore } = require('../utils/http');

// Public route - get all gejala 
router.get('/', gejalaController.getAllGejala); 

// Admin routes - require authentication
router.get('/admin', noStore, authenticateToken, gejalaController.getAllGejalaForAdmin);
router.get('/:id', noStore, authenticateToken, gejalaController.getGejalaById);
router.post('/', noStore, authenticateToken, gejalaController.addGejala);
router.put('/:id', noStore, authenticateToken, gejalaController.updateGejala);
router.delete('/:id', noStore, authenticateToken, gejalaController.deleteGejala);

module.exports = router;
