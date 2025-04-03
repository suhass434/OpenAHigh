const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { auth } = require('../middlewares/auth');

// All routes are protected and require authentication
router.use(auth);

// Get all chats for the authenticated user
router.get('/', chatController.getUserChats);

// Create a new chat
router.post('/', chatController.createChat);

// Update a chat
router.put('/:chatId', chatController.updateChat);

// Delete a chat
router.delete('/:chatId', chatController.deleteChat);

module.exports = router; 