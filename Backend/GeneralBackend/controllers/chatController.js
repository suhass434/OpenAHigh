const Chat = require('../models/chat');

// Get all chats for a user
exports.getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id })
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Error fetching chats' });
  }
};

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const chat = new Chat({
      userId: req.user._id,
      title: req.body.title,
      messages: req.body.messages || [{
        id: 1,
        text: "Hi! I'm CrawlShastra's AI assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date(),
        sources: []
      }]
    });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Error creating chat' });
  }
};

// Update a chat
exports.updateChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, userId: req.user._id },
      { 
        $set: {
          title: req.body.title,
          messages: req.body.messages
        }
      },
      { new: true }
    );
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ message: 'Error updating chat' });
  }
};

// Delete a chat
exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({
      _id: req.params.chatId,
      userId: req.user._id
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ message: 'Error deleting chat' });
  }
}; 