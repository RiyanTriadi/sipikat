const express = require('express');
const router = express.Router();
const diagnosaController = require('../controllers/diagnosaController');
const { authenticateToken } = require('../middleware/auth'); 
const { noStore } = require('../utils/http');

// Public route - user can submit diagnosis
router.post('/', noStore, diagnosaController.diagnoseUser); 

// Admin routes - require authentication
router.get('/', noStore, authenticateToken, diagnosaController.getAllDiagnosa); 
router.get('/:id', noStore, authenticateToken, diagnosaController.getDiagnosaById); 
router.put('/:id', noStore, authenticateToken, diagnosaController.updateDiagnosa); 
router.delete('/:id', noStore, authenticateToken, diagnosaController.deleteDiagnosa); 

module.exports = router;
