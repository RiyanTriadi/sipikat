const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth'); // Fixed: destructure

// All user routes require authentication
router.use(authenticateToken);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.addUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;