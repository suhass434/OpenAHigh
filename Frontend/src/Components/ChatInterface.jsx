import React, { useState, useRef, useEffect } from 'react';
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
  X 
} from 'lucide-react';

// Sidebar Chat Item Component
const ChatListItem = ({ chat, isActive, onSelect, onDelete }) => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div 
      className={`
        group relative flex items-center justify-between p-3 cursor-pointer 
        ${isActive ? 'bg-gray-100' : 'hover:bg-gray-50'}
        transition-colors duration-200
      `}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={onSelect}
    >
      <div className="flex items-center space-x-3">
        <MessageSquare className="w-5 h-5 text-gray-500" />
        <span className="text-sm truncate max-w-[150px]">
          {chat.title || 'New Chat'}
        </span>
      </div>
      {isHovering && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(chat.id);
          }}
          className="text-red-500 hover:bg-red-50 p-1 rounded-full"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Main Chat Interface
const ChatInterface = () => {
  const [chats, setChats] = useState([
    { 
      id: 1, 
      title: 'Research Project', 
      messages: [
        { 
          id: 1, 
          text: "Hi there! I'm your AI assistant. How can I help you today?", 
          sender: 'bot',
          timestamp: new Date()
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
  }, [activeChat.messages]);

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
            text: "Hi there! I'm your AI assistant. How can I help you today?", 
            sender: 'bot',
            timestamp: new Date()
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
      
      // If deleting the active chat, switch to another or create new
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
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage = {
        id: activeChat.messages.length + 1,
        text: inputMessage,
        sender: 'user',
        timestamp: new Date()
      };

      // Update the active chat's messages
      setChats(prev => prev.map(chat => 
        chat.id === activeChatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, newMessage] 
            } 
          : chat
      ));

      setInputMessage('');
      setIsProcessing(true);

      // Simulate bot response (replace with actual AI response later)
      setTimeout(() => {
        const botResponse = {
          id: activeChat.messages.length + 2,
          text: `I'm processing your request: "${inputMessage}"`,
          sender: 'bot',
          timestamp: new Date()
        };

        setChats(prev => prev.map(chat => 
          chat.id === activeChatId 
            ? { 
                ...chat, 
                messages: [...chat.messages, newMessage, botResponse] 
              } 
            : chat
        ));
        setIsProcessing(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* New Chat Button */}
        <button 
          onClick={createNewChat}
          className="m-4 flex items-center justify-center space-x-2 bg-indigo-500 text-white p-3 rounded-lg hover:bg-indigo-600 transition-colors"
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
        <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {activeChat.title || 'New Chat'}
          </h2>
          <div className="flex items-center space-x-2">
            <button className="text-gray-500 hover:bg-gray-100 p-2 rounded-full">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          {activeChat.messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`
                  max-w-2xl w-full p-4 rounded-2xl 
                  ${msg.sender === 'user' 
                    ? 'bg-indigo-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-800'
                  }
                `}
              >
                <div className="text-base leading-relaxed">{msg.text}</div>
                <div className={`
                  text-xs mt-2 opacity-60 
                  ${msg.sender === 'user' ? 'text-indigo-100 text-right' : 'text-gray-500 text-left'}
                `}>
                  {formatTimestamp(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white p-6 border-t border-gray-200">
          <div className="relative">
            <textarea 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Send a message..."
              rows={3}
              className="
                w-full p-4 pr-16 rounded-xl border border-gray-300 
                focus:outline-none focus:ring-2 focus:ring-indigo-500 
                resize-none transition-all duration-300
              "
            />
            <div className="absolute bottom-5 right-5 flex items-center space-x-2">
              <button 
                onClick={handleVoiceInput}
                className={`
                  p-2 rounded-full transition-colors 
                  ${isListening 
                    ? 'bg-red-100 text-red-500' 
                    : 'hover:bg-gray-100 text-gray-500'
                  }
                `}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isProcessing}
                className={`
                  bg-indigo-500 text-white p-2 rounded-full 
                  hover:bg-indigo-600 transition-all duration-300 
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
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;