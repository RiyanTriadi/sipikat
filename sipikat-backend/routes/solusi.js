const express = require('express');
const router = express.Router();
const solusiController = require('../controllers/solusiController');
const { authenticateToken } = require('../middleware/auth'); // Fixed: destructure
const { noStore } = require('../utils/http');

// All routes require authentication
router.get('/', noStore, authenticateToken, solusiController.getAllSolusi);
router.post('/', noStore, authenticateToken, solusiController.createSolusi);
router.put('/:id', noStore, authenticateToken, solusiController.updateSolusi);
router.delete('/:id', noStore, authenticateToken, solusiController.deleteSolusi);

module.exports = router;
