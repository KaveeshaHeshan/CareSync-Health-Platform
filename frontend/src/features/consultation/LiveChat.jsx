import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  MessageSquare,
  Send,
  Smile,
  Paperclip,
  X,
  Check,
  CheckCheck,
  Search,
  MoreVertical,
  Download,
  Trash2,
  Copy,
  Clock,
  AlertCircle,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

/**
 * LiveChat Component
 * 
 * Provides real-time chat functionality during video consultations.
 * Supports text messages, emojis, file sharing, and message history.
 * 
 * @component
 */
const LiveChat = ({
  messages = [],
  currentUserId,
  currentUserName,
  onSendMessage,
  onDeleteMessage,
  onClose,
  isVisible = true,
  participants = [],
  className = '',
}) => {
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Common emojis for quick access
  const commonEmojis = [
    '😊', '😂', '❤️', '👍', '👎', '🙏', '👏', '🎉',
    '😢', '😮', '🤔', '💯', '🔥', '✅', '❌', '⚠️',
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
      if (selectedMessage && !event.target.closest('.message-actions-container')) {
        setSelectedMessage(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, selectedMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    
    if (!messageText.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: messageText.trim(),
      senderId: currentUserId,
      senderName: currentUserName,
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: 'text',
    };

    onSendMessage?.(newMessage);
    setMessageText('');
    setIsTyping(false);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setMessageText(e.target.value);
    
    // Simulate typing indicator
    if (!isTyping) {
      setIsTyping(true);
      // In real implementation, send typing event to other users
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessageText(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    setSelectedMessage(null);
    // Show toast notification
    console.log('Message copied');
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Delete this message?')) {
      onDeleteMessage?.(messageId);
      setSelectedMessage(null);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    // Show time
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Clock size={14} className="text-slate-400" />;
      case 'sent':
        return <Check size={14} className="text-slate-400" />;
      case 'delivered':
        return <CheckCheck size={14} className="text-slate-400" />;
      case 'read':
        return <CheckCheck size={14} className="text-blue-500" />;
      case 'failed':
        return <AlertCircle size={14} className="text-red-500" />;
      default:
        return null;
    }
  };

  const filteredMessages = searchTerm
    ? messages.filter(msg =>
        msg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : messages;

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = new Date(msg.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  const messageGroups = groupMessagesByDate(filteredMessages);

  if (!isVisible) return null;

  return (
    <Card className={`flex flex-col h-full max-h-[600px] ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-indigo-600" size={20} />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Chat</h3>
              <p className="text-xs text-slate-500">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Toggle */}
            <Button
              onClick={() => setShowSearch(!showSearch)}
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-slate-100 rounded"
            >
              <Search size={18} />
            </Button>

            {/* Close Button */}
            {onClose && (
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-slate-100 rounded"
              >
                <X size={18} />
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <MessageSquare size={48} className="mb-3 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 'No messages found' : 'No messages yet'}
            </p>
            {!searchTerm && (
              <p className="text-xs mt-1">Start the conversation!</p>
            )}
          </div>
        ) : (
          <>
            {Object.entries(messageGroups).map(([date, msgs]) => (
              <div key={date}>
                {/* Date Separator */}
                <div className="flex items-center justify-center my-4">
                  <div className="bg-slate-200 text-slate-600 text-xs px-3 py-1 rounded-full">
                    {new Date(date).toLocaleDateString([], { 
                      month: 'short', 
                      day: 'numeric',
                      year: new Date(date).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                    })}
                  </div>
                </div>

                {/* Messages */}
                {msgs.map((message, index) => {
                  const isOwnMessage = message.senderId === currentUserId;
                  const showSenderName = index === 0 || msgs[index - 1].senderId !== message.senderId;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                        {/* Sender Name */}
                        {!isOwnMessage && showSenderName && (
                          <span className="text-xs text-slate-500 mb-1 px-3">
                            {message.senderName}
                          </span>
                        )}

                        {/* Message Bubble */}
                        <div className="relative message-actions-container">
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isOwnMessage
                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                : 'bg-white border border-slate-200 text-slate-900 rounded-bl-sm'
                            } ${message.status === 'failed' ? 'opacity-50' : ''}`}
                          >
                            {/* Message Text */}
                            <p className="text-sm break-words whitespace-pre-wrap">
                              {message.text}
                            </p>

                            {/* File Attachment */}
                            {message.type === 'file' && message.file && (
                              <div className="mt-2 p-2 bg-slate-100 rounded-lg flex items-center gap-2">
                                <Paperclip size={16} />
                                <span className="text-xs truncate flex-1">
                                  {message.file.name}
                                </span>
                                <Button
                                  onClick={() => console.log('Download file')}
                                  variant="ghost"
                                  size="sm"
                                  className="p-1"
                                >
                                  <Download size={14} />
                                </Button>
                              </div>
                            )}

                            {/* Timestamp & Status */}
                            <div className={`flex items-center gap-1 mt-1 ${
                              isOwnMessage ? 'justify-end' : 'justify-start'
                            }`}>
                              <span className={`text-xs ${
                                isOwnMessage ? 'text-indigo-200' : 'text-slate-500'
                              }`}>
                                {formatTimestamp(message.timestamp)}
                              </span>
                              {isOwnMessage && getMessageStatusIcon(message.status)}
                            </div>
                          </div>

                          {/* Message Actions */}
                          <Button
                            onClick={() => setSelectedMessage(
                              selectedMessage === message.id ? null : message.id
                            )}
                            variant="ghost"
                            size="sm"
                            className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-100 rounded"
                          >
                            <MoreVertical size={14} />
                          </Button>

                          {/* Actions Dropdown */}
                          {selectedMessage === message.id && (
                            <div className={`absolute ${
                              isOwnMessage ? 'right-0' : 'left-0'
                            } top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg min-w-40 py-1 z-50`}>
                              <button
                                onClick={() => handleCopyMessage(message.text)}
                                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                              >
                                <Copy size={14} />
                                Copy
                              </button>
                              {isOwnMessage && (
                                <button
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-slate-500 text-sm px-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>
                  {typingUsers.length === 1
                    ? `${typingUsers[0]} is typing...`
                    : `${typingUsers.length} people are typing...`}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200 bg-white">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="mb-2 emoji-picker-container">
            <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg">
              <div className="grid grid-cols-8 gap-2">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="text-2xl hover:bg-slate-100 rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          {/* Emoji Button */}
          <Button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-slate-100 rounded-lg flex-shrink-0"
          >
            <Smile size={20} className="text-slate-600" />
          </Button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={messageText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm max-h-24 overflow-y-auto"
              style={{
                minHeight: '40px',
                height: 'auto',
              }}
            />
          </div>

          {/* File Attachment (Optional) */}
          <Button
            type="button"
            onClick={() => console.log('Open file picker')}
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-slate-100 rounded-lg flex-shrink-0"
          >
            <Paperclip size={20} className="text-slate-600" />
          </Button>

          {/* Send Button */}
          <Button
            type="submit"
            disabled={!messageText.trim()}
            className="p-2 rounded-lg flex-shrink-0"
            variant="primary"
          >
            <Send size={20} />
          </Button>
        </form>

        {/* Message Count */}
        <div className="mt-2 text-xs text-slate-500 text-center">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </div>
      </div>
    </Card>
  );
};

LiveChat.propTypes = {
  /** Array of chat messages */
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      senderId: PropTypes.string.isRequired,
      senderName: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['sending', 'sent', 'delivered', 'read', 'failed']),
      type: PropTypes.oneOf(['text', 'file', 'system']),
      file: PropTypes.shape({
        name: PropTypes.string,
        url: PropTypes.string,
        size: PropTypes.number,
      }),
    })
  ),

  /** Current user's ID */
  currentUserId: PropTypes.string.isRequired,

  /** Current user's name */
  currentUserName: PropTypes.string.isRequired,

  /** Callback when sending a message */
  onSendMessage: PropTypes.func,

  /** Callback when deleting a message */
  onDeleteMessage: PropTypes.func,

  /** Callback to close the chat */
  onClose: PropTypes.func,

  /** Whether the chat is visible */
  isVisible: PropTypes.bool,

  /** Array of participants for context */
  participants: PropTypes.array,

  /** Additional CSS classes */
  className: PropTypes.string,
};

export default LiveChat;

/**
 * Example usage:
 * 
 * import LiveChat from './LiveChat';
 * 
 * const MyVideoCall = () => {
 *   const [messages, setMessages] = useState([
 *     {
 *       id: '1',
 *       text: 'Hello! How can I help you today?',
 *       senderId: 'doctor123',
 *       senderName: 'Dr. Sarah Smith',
 *       timestamp: new Date().toISOString(),
 *       status: 'read',
 *       type: 'text',
 *     },
 *   ]);
 * 
 *   const handleSendMessage = (message) => {
 *     setMessages(prev => [...prev, message]);
 *     // Send to backend/socket
 *   };
 * 
 *   return (
 *     <LiveChat
 *       messages={messages}
 *       currentUserId="patient456"
 *       currentUserName="John Doe"
 *       onSendMessage={handleSendMessage}
 *       onDeleteMessage={(id) => setMessages(prev => prev.filter(m => m.id !== id))}
 *       participants={[
 *         { id: 'doctor123', name: 'Dr. Sarah Smith' },
 *         { id: 'patient456', name: 'John Doe' },
 *       ]}
 *     />
 *   );
 * };
 */
