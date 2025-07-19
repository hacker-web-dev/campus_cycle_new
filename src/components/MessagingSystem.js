import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaUser, FaArrowLeft } from 'react-icons/fa';
import ApiService from '../services/api';

const MessagingSystem = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Load conversations when component mounts or opens
  useEffect(() => {
    if (user && isOpen) {
      loadConversations();
    }
  }, [user, isOpen]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 30 seconds
  useEffect(() => {
    if (user && isOpen) {
      const interval = setInterval(() => {
        if (selectedConversation) {
          loadMessages(selectedConversation.participants.find(p => p._id !== user.id)._id);
        }
        loadConversations();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, isOpen, selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const data = await ApiService.getConversations();
      setConversations(data);
      
      // Calculate unread count (simplified - you'd need unread message tracking in backend)
      const unread = data.filter(conv => 
        conv.lastMessage && 
        conv.lastMessage.sender !== user.id && 
        !conv.lastMessage.read
      ).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (userId) => {
    try {
      setLoading(true);
      const data = await ApiService.getMessages(userId);
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const receiverId = selectedConversation.participants.find(p => p._id !== user.id)._id;

    try {
      const response = await ApiService.sendMessage(receiverId, newMessage);
      
      // Add the new message to the current conversation
      setMessages(prev => [...prev, response.messageData]);
      setNewMessage('');
      
      // Refresh conversations to update last message
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Messaging Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40"
          title="Open Messages"
        >
          <FaComments className="text-xl" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Messaging Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-20 w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex z-40">
          {/* Conversations Sidebar */}
          <div className={`${selectedConversation ? 'w-32' : 'w-full'} border-r border-gray-200 flex flex-col transition-all duration-300`}>
            {/* Header */}
            <div className="bg-green-600 text-white p-3 rounded-tl-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaComments className="text-lg" />
                {!selectedConversation && <span className="font-medium">Messages</span>}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-green-700 p-1 rounded transition-colors"
                title="Close"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <FaComments className="mx-auto text-2xl mb-2" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const otherUser = conversation.participants.find(p => p._id !== user.id);
                  return (
                    <div
                      key={conversation._id}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        loadMessages(otherUser._id);
                      }}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedConversation?._id === conversation._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                          <FaUser className="text-gray-600 text-sm" />
                        </div>
                        {!selectedConversation && (
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{otherUser?.name}</div>
                            {conversation.lastMessage && (
                              <div className="text-xs text-gray-500 truncate">
                                {conversation.lastMessage.content}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedConversation && (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="bg-gray-50 p-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-200 rounded-full h-8 w-8 flex items-center justify-center">
                    <FaUser className="text-gray-600 text-sm" />
                  </div>
                  <span className="font-medium text-sm">
                    {selectedConversation.participants.find(p => p._id !== user.id)?.name}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
                  title="Back to conversations"
                >
                  <FaArrowLeft className="text-sm" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isCurrentUser = message.sender._id === user.id;
                    const showDate = index === 0 || formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
                    
                    return (
                      <div key={message._id}>
                        {showDate && (
                          <div className="text-center text-xs text-gray-500 my-2">
                            {formatDate(message.createdAt)}
                          </div>
                        )}
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              isCurrentUser
                                ? 'bg-green-600 text-white ml-2'
                                : 'bg-gray-100 text-gray-800 mr-2'
                            }`}
                          >
                            <div>{message.content}</div>
                            <div
                              className={`text-xs mt-1 opacity-70 ${
                                isCurrentUser ? 'text-green-100' : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                  >
                    <FaPaperPlane className="text-sm" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default MessagingSystem;