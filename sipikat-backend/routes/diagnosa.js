const express = require('express');
const router = express.Router();
const diagnosaController = require('../controllers/diagnosaController');
const { authenticateToken } = require('../middleware/auth'); // Fixed: destructure

// Public route - user can submit diagnosis
router.post('/', diagnosaController.diagnoseUser); 

// Admin routes - require authentication
router.get('/', authenticateToken, diagnosaController.getAllDiagnosa); 
router.get('/:id', authenticateToken, diagnosaController.getDiagnosaById); 
router.put('/:id', authenticateToken, diagnosaController.updateDiagnosa); 
router.delete('/:id', authenticateToken, diagnosaController.deleteDiagnosa); 

module.exports = router;