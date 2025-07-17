const express = require('express');
const router = express.Router();
const diagnosaController = require('../controllers/diagnosaController');
const authenticateToken = require('../middleware/auth');

router.post('/', diagnosaController.diagnoseUser); 
router.get('/', authenticateToken, diagnosaController.getAllDiagnosa); 
router.get('/:id', authenticateToken, diagnosaController.getDiagnosaById); 
router.put('/:id', authenticateToken, diagnosaController.updateDiagnosa); 
router.delete('/:id', authenticateToken, diagnosaController.deleteDiagnosa); 

module.exports = router;