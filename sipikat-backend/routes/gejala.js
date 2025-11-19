const express = require('express');
const router = express.Router();
const gejalaController = require('../controllers/gejalaController');
const { authenticateToken } = require('../middleware/auth'); // Fixed: destructure

// Public route - get all gejala (without MB values)
router.get('/', gejalaController.getAllGejala); 

// Admin routes - require authentication
router.get('/admin', authenticateToken, gejalaController.getAllGejalaForAdmin);
router.get('/:id', authenticateToken, gejalaController.getGejalaById);
router.post('/', authenticateToken, gejalaController.addGejala);
router.put('/:id', authenticateToken, gejalaController.updateGejala);
router.delete('/:id', authenticateToken, gejalaController.deleteGejala);

module.exports = router;