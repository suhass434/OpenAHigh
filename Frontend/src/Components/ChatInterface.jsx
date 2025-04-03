import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Send, 
  Mic, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Copy, 
  MoreVertical, 
  Check, 
  Settings, 
  X,
  Sun,
  Moon
} from 'lucide-react';
import axios from 'axios';
import { toggleDarkMode } from '../Slices/themeSlice';

// Sidebar Chat Item Component
const ChatListItem = ({ chat, isActive, onSelect, onDelete }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div 
      className={`
        group relative flex items-center justify-between p-2 sm:p-3 cursor-pointer 
        ${isActive 
          ? 'bg-indigo-50 dark:bg-indigo-900/30' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }
        transition-colors duration-200
      `}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-2 sm:space-x-3">
        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
        <span className="text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[150px] text-gray-700 dark:text-gray-300">
          {chat.title || 'New Chat'}
        </span>
      </div>
      {(isHovering || window.innerWidth < 640) && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chat.id);
          }}
          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded-full"
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
  );
};

// Helper function to clean source path
const cleanSourcePath = (source) => {
  if (!source) return '';
  // Get just the filename from the path
  const filename = source.split('/').pop();
  return filename;
};

// Main Chat Interface
const ChatInterface = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.darkMode);
  const [chats, setChats] = useState([
    { 
      id: 1, 
      title: 'New Chat', 
      messages: [
        { 
          id: 1, 
          text: "Hi! I'm CrawlShastra's AI assistant. How can I help you today?", 
          sender: 'bot',
          timestamp: new Date(),
          sources: []
        }
      ]
    }
  ]);
  const [activeChatId, setActiveChatId] = useState(1);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Get active chat
  const activeChat = chats.find(chat => chat.id === activeChatId);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat?.messages]);

  // Apply theme class to html element
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Create a new chat
  const createNewChat = () => {
    const newChatId = Date.now();
    setChats(prev => [
      ...prev, 
      { 
        id: newChatId, 
        title: 'New Chat', 
        messages: [
          { 
            id: 1, 
            text: "Hi! I'm CrawlShastra's AI assistant. How can I help you today?", 
            sender: 'bot',
            timestamp: new Date(),
            sources: []
          }
        ]
      }
    ]);
    setActiveChatId(newChatId);
  };

  // Delete a chat
  const deleteChat = (chatId) => {
    setChats(prev => {
      const remainingChats = prev.filter(chat => chat.id !== chatId);
      
      if (chatId === activeChatId) {
        if (remainingChats.length > 0) {
          setActiveChatId(remainingChats[0].id);
        } else {
          createNewChat();
        }
      }
      
      return remainingChats;
    });
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage = {
        id: activeChat.messages.length + 1,
        text: inputMessage,
        sender: 'user',
        timestamp: new Date(),
        sources: []
      };

      // Add user message to chat
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, userMessage] 
            } 
          : chat
      ));

      setInputMessage('');
      setIsProcessing(true);

      try {
        // Make API call to backend
        const response = await axios.post('http://localhost:5001/api/chat', {
          question: inputMessage
        });

        // Add bot response to chat
        const botResponse = {
          id: activeChat.messages.length + 2,
          text: response.data.answer,
          sender: 'bot',
          timestamp: new Date(),
          sources: response.data.sources
        };

        setChats(prev => prev.map(chat => 
          chat.id === activeChatId 
            ? { 
                ...chat, 
                messages: [...chat.messages, botResponse],
                // Update chat title if it's the first user message
                title: chat.messages.length <= 1 ? inputMessage.slice(0, 30) + '...' : chat.title
              } 
            : chat
        ));
      } catch (error) {
        console.error('Error getting response:', error);
        
        // Add error message to chat
        const errorMessage = {
          id: activeChat.messages.length + 2,
          text: "I apologize, but I encountered an error. Please try again.",
          sender: 'bot',
          timestamp: new Date(),
          sources: []
        };

        setChats(prev => prev.map(chat => 
          chat.id === activeChatId 
            ? { 
                ...chat, 
                messages: [...chat.messages, errorMessage] 
              } 
            : chat
        ));
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Implement actual voice recognition here
    if (!isListening) {
      console.log('Started listening...');
    } else {
      console.log('Stopped listening...');
    }
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`
        w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 
        flex flex-col transition-all duration-300 ease-in-out
        fixed md:relative left-0 top-0 h-full
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        z-20
      `}>
        {/* New Chat Button */}
        <button 
          onClick={createNewChat}
          className="m-2 sm:m-4 flex items-center justify-center space-x-2 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white p-2 sm:p-3 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">New Chat</span>
        </button>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chats.map(chat => (
            <ChatListItem 
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onSelect={() => setActiveChatId(chat.id)}
              onDelete={deleteChat}
            />
          ))}
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed bottom-4 left-4 z-30 p-3 rounded-full bg-indigo-500 text-white shadow-lg"
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeChat?.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`
                max-w-[85%] sm:max-w-[75%] rounded-lg p-3 sm:p-4
                ${message.sender === 'user'
                  ? 'bg-indigo-500 text-white'
                  : isDarkMode
                    ? 'bg-gray-800 text-gray-200'
                    : 'bg-gray-100 text-gray-900'
                }
              `}>
                <p className="text-sm sm:text-base whitespace-pre-wrap">{message.text}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {message.sources.map((source, index) => (
                      <span 
                        key={index} 
                        className={`text-xs px-2 py-1 rounded-full ${
                          message.sender === 'user'
                            ? 'bg-indigo-400/30 text-white'
                            : isDarkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {cleanSourcePath(source.source)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-1 text-xs opacity-75 text-right">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className={`w-full p-2 sm:p-3 pr-10 rounded-lg border resize-none ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-200'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                rows="1"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              {isProcessing && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent" />
                </div>
              )}
            </div>
            <button
              onClick={handleVoiceInput}
              className={`p-2 rounded-lg ${
                isListening
                  ? 'bg-red-500 text-white'
                  : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              className={`p-2 rounded-lg ${
                !inputMessage.trim() || isProcessing
                  ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;