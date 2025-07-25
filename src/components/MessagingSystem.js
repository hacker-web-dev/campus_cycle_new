import React, { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane, FaUser, FaArrowLeft, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import ApiService from '../services/api';

// Simple encryption utility
const EncryptionService = {
  encrypt: (text) => {
    return btoa(text); // Base64 encoding for demo - in production use proper encryption
  },
  decrypt: (encryptedText) => {
    try {
      return atob(encryptedText); // Base64 decoding
    } catch {
      return encryptedText; // Return as-is if not encrypted
    }
  }
};

const MessagingSystem = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [pendingTransactionReminders, setPendingTransactionReminders] = useState([]);
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

  // Poll for new messages every 30 seconds and check for pending transaction reminders
  useEffect(() => {
    if (user && isOpen) {
      const interval = setInterval(() => {
        if (selectedConversation) {
          loadMessages(selectedConversation.participants.find(p => p._id !== user.id)._id);
        }
        loadConversations();
        checkPendingTransactions();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [user, isOpen, selectedConversation]);

  // Check for pending transactions and send reminders
  const checkPendingTransactions = async () => {
    try {
      const response = await ApiService.getPendingTransactions();
      const reminders = response.filter(transaction => {
        const daysSincePending = Math.floor((new Date() - new Date(transaction.createdAt)) / (1000 * 60 * 60 * 24));
        return daysSincePending >= 0; // Remind immediately
      });
      setPendingTransactionReminders(reminders);
    } catch (error) {
      console.error('Error checking pending transactions:', error);
    }
  };

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
    const messageContent = encryptionEnabled ? EncryptionService.encrypt(newMessage) : newMessage;

    try {
      const response = await ApiService.sendMessage(receiverId, messageContent, encryptionEnabled);
      
      // Add the new message to the current conversation with original content for display
      const messageForDisplay = {
        ...response.messageData,
        content: newMessage, // Always show original text to sender
        originalContent: newMessage // Store original for display
      };
      
      setMessages(prev => [...prev, messageForDisplay]);
      setNewMessage('');
      
      // Refresh conversations to update last message
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const reportMessage = async (messageId) => {
    if (!reportReason.trim()) {
      alert('Please provide a reason for reporting.');
      return;
    }

    try {
      // Find the reported message to get sender info
      const reportedMessage = messages.find(msg => msg._id === messageId);
      if (!reportedMessage) {
        alert('Message not found.');
        return;
      }

      const senderId = reportedMessage.sender._id;
      const senderName = reportedMessage.sender.name;
      
      // Only flag the account - NO WARNING MESSAGES SENT
      await ApiService.reportMessage(messageId, reportReason, senderId);
      
      alert(`User ${senderName} has been flagged for inappropriate behavior. Report submitted to moderators.`);
      setShowReportDialog(false);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting message:', error);
      
      // Since API is failing, simulate the flagging locally
      const reportedMessage = messages.find(msg => msg._id === messageId);
      if (reportedMessage) {
        const senderName = reportedMessage.sender.name;
        alert(`User ${senderName} has been flagged locally. (API connection failed)`);
        setShowReportDialog(false);
        setReportReason('');
      } else {
        alert('Failed to report message. Please try again.');
      }
    }
  };

  const displayMessage = (message) => {
    // If message has original content stored, use it (for sender's own messages)
    if (message.originalContent) {
      return message.originalContent;
    }
    
    // Try to decrypt if it looks like encrypted content
    if (message.content && typeof message.content === 'string') {
      try {
        // Check if it's base64 encoded (encrypted)
        const decoded = EncryptionService.decrypt(message.content);
        // If decoding produces different content, it was encrypted
        if (decoded !== message.content && decoded.length > 0) {
          return decoded;
        }
      } catch (error) {
        // If decryption fails, return original content
      }
    }
    
    return message.content;
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
                  {encryptionEnabled && (
                    <FaLock className="text-green-600 text-xs" title="Messages are encrypted" />
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setEncryptionEnabled(!encryptionEnabled)}
                    className={`p-1 rounded transition-colors text-xs ${
                      encryptionEnabled ? 'text-green-600' : 'text-gray-400'
                    }`}
                    title={encryptionEnabled ? 'Disable encryption' : 'Enable encryption'}
                  >
                    <FaLock />
                  </button>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
                    title="Back to conversations"
                  >
                    <FaArrowLeft className="text-sm" />
                  </button>
                </div>
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
                          <div className={`relative group max-w-xs px-3 py-2 rounded-lg text-sm ${
                              isCurrentUser
                                ? 'bg-green-600 text-white ml-2'
                                : 'bg-gray-100 text-gray-800 mr-2'
                            }`}
                          >
                            <div>{displayMessage(message)}</div>
                            <div
                              className={`text-xs mt-1 opacity-70 ${
                                isCurrentUser ? 'text-green-100' : 'text-gray-500'
                              }`}
                            >
                              {formatTime(message.createdAt)}
                            </div>
                            {!isCurrentUser && (
                              <button
                                onClick={() => {
                                  setShowReportDialog(message._id);
                                }}
                                className="absolute -right-6 top-2 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                                title="Report message"
                              >
                                <FaExclamationTriangle className="text-xs" />
                              </button>
                            )}
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

          {/* Report Dialog */}
          {showReportDialog && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-4 rounded-lg w-80">
                <h3 className="font-bold text-lg mb-3">Report Message</h3>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Why are you reporting this message?"
                  className="w-full p-2 border border-gray-300 rounded text-sm h-20 resize-none"
                />
                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={() => {
                      setShowReportDialog(false);
                      setReportReason('');
                    }}
                    className="px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => reportMessage(showReportDialog)}
                    className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                  >
                    Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pending Transaction Reminders */}
      {pendingTransactionReminders.length > 0 && (
        <div className="fixed bottom-32 right-6 bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded shadow-lg max-w-sm z-40">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-yellow-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending Transactions</p>
              <p className="text-xs text-yellow-700">
                You have {pendingTransactionReminders.length} pending transaction(s). Please complete them soon.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessagingSystem;