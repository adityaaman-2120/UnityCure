import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('demo-user-123'); // Demo user ID
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history on component mount
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await apiService.getChatHistory(userId);
      if (response.ok && response.messages.length > 0) {
        const formattedMessages = response.messages.map(msg => ({
          id: msg.id,
          text: msg.user_message,
          sender: 'user',
          timestamp: new Date(msg.created_at)
        }));
        
        // Add bot responses
        const botMessages = response.messages.map(msg => ({
          id: `bot-${msg.id}`,
          text: msg.bot_response,
          sender: 'bot',
          timestamp: new Date(msg.created_at)
        }));
        
        // Combine and sort messages
        const allMessages = [...formattedMessages, ...botMessages]
          .sort((a, b) => a.timestamp - b.timestamp);
        
        setMessages(allMessages);
      } else {
        // Add welcome message if no history
        setMessages([{
          id: 'welcome',
          text: "Hello! I'm your UnityCure AI assistant. How can I help you today?",
          sender: 'bot',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setMessages([{
        id: 'welcome',
        text: "Hello! I'm your UnityCure AI assistant. How can I help you today?",
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await apiService.sendChatMessage(inputMessage, userId);
      
      if (response.ok) {
        const botMessage = {
          id: `bot-${Date.now()}`,
          text: response.response,
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        const errorMessage = {
          id: `error-${Date.now()}`,
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage = {
        id: `error-${Date.now()}`,
        text: 'Sorry, I\'m having trouble connecting. Please try again later.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      text: "Hello! I'm your UnityCure AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h3>
          <span className="bot-icon">🤖</span>
          UnityCure AI Assistant
        </h3>
        <button onClick={clearChat} className="clear-btn">
          Clear Chat
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-content">
              {message.sender === 'bot' && (
                <span className="bot-avatar">🤖</span>
              )}
              <div className="message-text">{message.text}</div>
              {message.sender === 'user' && (
                <span className="user-avatar">👤</span>
              )}
            </div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message bot-message">
            <div className="message-content">
              <span className="bot-avatar">🤖</span>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <div className="input-container">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            rows="1"
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || loading}
            className="send-btn"
          >
            {loading ? '⏳' : '📤'}
          </button>
        </div>
        
        <div className="input-hint">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>

      <div className="chatbot-footer">
        <small>
          User ID: {userId} | Messages are stored in MySQL database
        </small>
      </div>
    </div>
  );
};

export default Chatbot;
