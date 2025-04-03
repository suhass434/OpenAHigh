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
        group relative flex items-center justify-between p-3 cursor-pointer 
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
      <div className="flex items-center space-x-3">
        <MessageSquare className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <span className="text-sm truncate max-w-[150px] text-gray-700 dark:text-gray-300">
          {chat.title || 'New Chat'}
        </span>
      </div>
      {isHovering && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chat.id);
          }}
          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1 rounded-full"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
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
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* New Chat Button */}
        <button 
          onClick={createNewChat}
          className="m-4 flex items-center justify-center space-x-2 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white p-3 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            {activeChat.title || 'New Chat'}
          </h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => dispatch(toggleDarkMode())}
              className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <button className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
          {activeChat.messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-2xl p-4 rounded-2xl shadow-sm
                  ${msg.sender === 'user' 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                  }
                `}
              >
                <div className="text-base leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className={`
                    mt-4 pt-4 
                    ${msg.sender === 'user' 
                      ? 'border-t border-indigo-400' 
                      : 'border-t border-gray-200 dark:border-gray-700'
                    }
                  `}>
                    <div className={`
                      text-sm font-medium mb-2
                      ${msg.sender === 'user' 
                        ? 'text-indigo-100' 
                        : 'text-gray-500 dark:text-gray-400'
                      }
                    `}>
                      Sources:
                    </div>
                    <div className="space-y-2">
                      {msg.sources.map((source, index) => (
                        <div 
                          key={index} 
                          className={`
                            text-sm p-2 rounded
                            ${msg.sender === 'user'
                              ? 'bg-indigo-600/50 text-indigo-100'
                              : 'bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300'
                            }
                          `}
                        >
                          {source.source.split('/').pop()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className={`
                  text-xs mt-2 opacity-60
                  ${msg.sender === 'user' 
                    ? 'text-indigo-100 text-right' 
                    : 'text-gray-500 dark:text-gray-400 text-left'
                  }
                `}>
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-900 p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="relative">
            <textarea 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Send a message..."
              rows={3}
              disabled={isProcessing}
              className={`
                w-full p-4 pr-16 rounded-xl 
                border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-800 
                text-gray-900 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 
                resize-none transition-all duration-300
                ${isProcessing ? 'bg-gray-50 dark:bg-gray-900' : ''}
              `}
            />
            <div className="absolute bottom-5 right-5 flex items-center space-x-2">
              <button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isProcessing}
                className={`
                  bg-indigo-500 dark:bg-indigo-600 text-white p-2 rounded-full 
                  hover:bg-indigo-600 dark:hover:bg-indigo-700 
                  transition-all duration-300 
                  ${!inputMessage.trim() || isProcessing 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                  }
                `}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
          {isProcessing && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Processing your request...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;