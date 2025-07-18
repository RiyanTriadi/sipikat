const express = require('express');
const router = express.Router();
const solusiController = require('../controllers/solusiController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, solusiController.getAllSolusi);
router.post('/', authenticateToken, solusiController.createSolusi);
router.put('/:id', authenticateToken, solusiController.updateSolusi);
router.delete('/:id', authenticateToken, solusiController.deleteSolusi);

module.exports = router;