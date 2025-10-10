/**
 * Professional Chat Interface - Clean, minimal, mobile-optimized
 */

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ProfessionalChatProps {
  className?: string;
}

export function ProfessionalChat({ className = '' }: ProfessionalChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'I am Morpheus Nexus, Oracle of Solana. How may I assist you?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || 'I am processing your request.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Connection error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`professional-chat ${className} ${isExpanded ? 'expanded' : ''}`}>
      {/* Chat Header */}
      <div className="chat-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="chat-title">
          <span className="chat-label">ORACLE INTERFACE</span>
          <span className="chat-status">ONLINE</span>
        </div>
        <div className="chat-toggle">
          <span className="toggle-icon">{isExpanded ? '−' : '+'}</span>
        </div>
      </div>

      {/* Chat Messages */}
      {isExpanded && (
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.isUser ? 'user' : 'ai'}`}>
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message ai">
              <div className="message-content">
                <div className="message-text">
                  <span className="typing-indicator">Processing</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Chat Input */}
      {isExpanded && (
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Query the Oracle..."
              className="chat-input"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="chat-submit"
              disabled={isLoading || !inputValue.trim()}
            >
              SEND
            </button>
          </div>
        </form>
      )}

      {/* Professional Styles */}
      <style jsx>{`
        .professional-chat {
          position: fixed;
          bottom: 60px;
          right: 20px;
          width: 400px;
          max-height: 500px;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .professional-chat.expanded {
          height: 500px;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
          border-bottom: 1px solid rgba(139, 92, 246, 0.2);
        }

        .chat-title {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .chat-label {
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          color: #8b5cf6;
          letter-spacing: 1px;
        }

        .chat-status {
          font-family: 'Courier New', monospace;
          font-size: 0.7rem;
          color: #10b981;
          letter-spacing: 1px;
        }

        .chat-toggle {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 4px;
        }

        .toggle-icon {
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          color: #8b5cf6;
          font-weight: bold;
        }

        .chat-messages {
          height: 300px;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          display: flex;
          flex-direction: column;
        }

        .message.user {
          align-items: flex-end;
        }

        .message.ai {
          align-items: flex-start;
        }

        .message-content {
          max-width: 80%;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          position: relative;
        }

        .message.user .message-content {
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.4);
        }

        .message.ai .message-content {
          background: rgba(31, 41, 55, 0.8);
          border: 1px solid rgba(75, 85, 99, 0.4);
        }

        .message-text {
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
          color: #e5e7eb;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }

        .message-time {
          font-family: 'Courier New', monospace;
          font-size: 0.7rem;
          color: #6b7280;
          text-align: right;
        }

        .message.ai .message-time {
          text-align: left;
        }

        .typing-indicator {
          color: #8b5cf6;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .chat-input-form {
          padding: 1rem;
          border-top: 1px solid rgba(139, 92, 246, 0.2);
        }

        .input-container {
          display: flex;
          gap: 0.5rem;
        }

        .chat-input {
          flex: 1;
          background: rgba(31, 41, 55, 0.8);
          border: 1px solid rgba(75, 85, 99, 0.4);
          border-radius: 4px;
          padding: 0.75rem;
          color: #e5e7eb;
          font-family: 'Courier New', monospace;
          font-size: 0.9rem;
        }

        .chat-input:focus {
          outline: none;
          border-color: #8b5cf6;
        }

        .chat-input::placeholder {
          color: #6b7280;
        }

        .chat-submit {
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 4px;
          padding: 0.75rem 1rem;
          color: #8b5cf6;
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 1px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .chat-submit:hover:not(:disabled) {
          background: rgba(139, 92, 246, 0.3);
        }

        .chat-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .professional-chat {
            right: 10px;
            left: 10px;
            width: auto;
            bottom: 80px;
          }

          .professional-chat.expanded {
            height: 400px;
          }

          .chat-messages {
            height: 250px;
          }

          .message-content {
            max-width: 90%;
          }
        }

        @media (max-width: 480px) {
          .professional-chat {
            bottom: 100px;
          }

          .professional-chat.expanded {
            height: 350px;
          }

          .chat-messages {
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
}
