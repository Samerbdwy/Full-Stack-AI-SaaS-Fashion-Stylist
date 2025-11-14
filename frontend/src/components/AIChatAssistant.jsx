// components/AIChatAssistant.jsx - MOBILE RESPONSIVE VERSION
import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

// Memoized Message Component to prevent re-renders
const MessageBubble = memo(({ message }) => {
  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
    >
      <motion.div
        className={`max-w-[85%] xs:max-w-xs sm:max-w-sm md:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
          message.isAI
            ? 'bg-gray-800 text-white rounded-bl-none'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-none'
        }`}
      >
        <div className="whitespace-pre-wrap break-words message-content text-sm sm:text-base">
          {message.isAI ? (
            <ReactMarkdown
              components={{
                strong: ({node, ...props}) => (
                  <strong className="font-bold text-purple-300" {...props} />
                ),
                em: ({node, ...props}) => (
                  <em className="italic text-pink-300" {...props} />
                ),
                ul: ({node, ...props}) => (
                  <ul className="list-disc list-inside space-y-1 mt-1" {...props} />
                ),
                li: ({node, ...props}) => (
                  <li className="text-white" {...props} />
                )
              }}
            >
              {message.text}
            </ReactMarkdown>
          ) : (
            message.text
          )}
        </div>
        <div className="text-xs opacity-70 mt-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </motion.div>
    </motion.div>
  )
});

MessageBubble.displayName = 'MessageBubble';

const AIChatAssistant = ({ onSendMessage, trendContext, onClearContext, userId }) => {
  // Generate a user-specific localStorage key
  const localStorageKey = userId ? `fashionai_chat_history_${userId}` : 'fashionai_chat_history_guest';

  // Load messages from localStorage on component mount
  const [messages, setMessages] = useState(() => {
    const savedChat = localStorage.getItem(localStorageKey);
    return savedChat ? JSON.parse(savedChat).map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    })) : [
      {
        id: 1,
        text: "Hey! I'm your AI Fashion Stylist 👗 What kind of look are you feeling today?",
        isAI: true,
        timestamp: new Date()
      }
    ];
  });
  
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const messagesContainerRef = useRef(null)
  
  // FIXED: Use refs to track state that shouldn't trigger re-renders
  const hasAutoSentRef = useRef(false)
  const hasProcessedContextRef = useRef(false)

  // Effect to reset chat when userId changes
  useEffect(() => {
    // Only reset if userId is valid and has changed
    if (userId) {
      const savedChat = localStorage.getItem(localStorageKey);
      if (savedChat) {
        setMessages(JSON.parse(savedChat).map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      } else {
        setMessages([
          {
            id: 1,
            text: "Hey! I'm your AI Fashion Stylist 👗 What kind of look are you feeling today?",
            isAI: true,
            timestamp: new Date()
          }
        ]);
      }
      hasAutoSentRef.current = false;
      hasProcessedContextRef.current = false;
    }
  }, [userId, localStorageKey]);

  // Debounced localStorage saving
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(localStorageKey, JSON.stringify(messages));
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [messages, localStorageKey]);

  // FIXED: Better scroll function
  const scrollToBottom = useCallback((behavior = "smooth") => {
    requestAnimationFrame(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: behavior,
          block: "nearest"
        });
      }
    });
  }, []);

  // FIXED: Scroll when messages change
  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, scrollToBottom]);

  // FIXED: COMPLETELY NEW AUTO-SEND LOGIC - NO DUPLICATES
  useEffect(() => {
    // If no trend context or we've already processed, do nothing
    if (!trendContext || hasProcessedContextRef.current) {
      return;
    }

    // Mark as processed immediately
    hasProcessedContextRef.current = true;
    
    const processTrendContext = async () => {
      console.log('🎯 Processing trend context:', trendContext);
      
      // Create user message
      const userMessage = {
        id: Date.now(),
        text: trendContext,
        isAI: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setIsTyping(true);

      try {
        const response = await onSendMessage(trendContext);
        
        const aiResponse = {
          id: Date.now() + 1,
          text: response.response || `I'd love to help you with the "${trendContext.split('"')[1]}" trend! Let me suggest some styling options...`,
          isAI: true,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiResponse]);
        
        // Clear the context after successful send
        if (onClearContext) {
          setTimeout(() => {
            onClearContext();
          }, 100);
        }
        
      } catch (error) {
        console.error('❌ AI Chat error:', error);
        const errorResponse = {
          id: Date.now() + 1,
          text: "I'm having trouble connecting right now. Please try again! ⚡",
          isAI: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorResponse]);
      } finally {
        setIsTyping(false);
      }
    };

    processTrendContext();
  }, [trendContext, onSendMessage, onClearContext]);

  // Enhanced formatting with Markdown support
  const getFallbackResponse = useCallback((userMessage) => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return "Hello! I'm your **AI Fashion Stylist**! 👋 How can I help you with your style today?"
    } else if (lowerMessage.includes('night out') || lowerMessage.includes('party')) {
      return "For a night out, I'd recommend:\n\n- **Sleek black leather jacket**\n- **Dark wash jeans**  \n- **Statement boots**  \n- Silver jewelry to elevate the look! 🖤"
    } else if (lowerMessage.includes('date') || lowerMessage.includes('romantic')) {
      return "For a date night, try:\n\n- **Fitted sweater**  \n- **Tailored trousers**  \n- **Clean sneakers**  \n\nKeep it sophisticated but comfortable! 💫"
    } else if (lowerMessage.includes('work') || lowerMessage.includes('office')) {
      return "For the office, go with:\n\n- **Structured blazer**  \n- **Crisp white shirt**  \n- **Tailored pants**  \n\nProfessional yet stylish! 👔"
    } else if (lowerMessage.includes('casual') || lowerMessage.includes('weekend')) {
      return "For a casual day:\n\n- **Oversized hoodie**  \n- **Relaxed jeans**  \n- **Platform sneakers**  \n\nComfort meets style! 😎"
    } else {
      return "That sounds interesting! As your AI stylist, I'd recommend experimenting with **different textures** and **layers** to create unique looks. Want me to suggest something specific for an occasion or mood? 🎨"
    }
  }, []);

  // FIXED: Message handler with better scroll behavior
  const handleSendMessage = useCallback(async () => {
    if (inputMessage.trim() === '') return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      isAI: false,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      console.log('💬 Sending message to backend:', inputMessage)
      const response = await onSendMessage(inputMessage)
      
      const aiResponse = {
        id: Date.now() + 1,
        text: response.response || getFallbackResponse(inputMessage),
        isAI: true,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiResponse])
      
    } catch (error) {
      console.error('❌ AI Chat error:', error)
      const errorResponse = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Please try again in a moment! ⚡",
        isAI: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }, [inputMessage, onSendMessage, getFallbackResponse]);

  // Optimized input handler with debouncing
  const handleInputChange = useCallback((e) => {
    setInputMessage(e.target.value);
  }, []);

  // Optimized key press handler
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const quickQuestions = [
    "What should I wear for a night out?",
    "Office outfit ideas?",
    "Casual weekend look?",
    "Date night suggestions?"
  ]

  // Clear chat history
  const clearChat = useCallback(() => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([
        {
          id: 1,
          text: "Hey! I'm your AI Fashion Stylist 👗 What kind of look are you feeling today?",
          isAI: true,
          timestamp: new Date()
        }
      ]);
      // Reset refs when clearing chat
      hasAutoSentRef.current = false;
      hasProcessedContextRef.current = false;
    }
  }, []);

  // Quick question handler
  const handleQuickQuestion = useCallback((question) => {
    setInputMessage(question);
    setTimeout(() => {
      handleSendMessage();
    }, 50);
  }, [handleSendMessage]);

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/80 backdrop-blur-lg rounded-3xl border border-gray-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900 to-pink-900 p-4 sm:p-6">
          <div className="flex items-center justify-between flex-col sm:flex-row gap-4 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-xl sm:text-2xl">👗</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">AI Fashion Stylist</h2>
                {trendContext && (
                  <p className="text-purple-200 text-xs sm:text-sm mt-1 truncate max-w-[200px] sm:max-w-none">
                    💫 Discussing: {trendContext.split('"')[1]}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={clearChat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/20 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm hover:bg-white/30 transition-all"
              >
                Clear Chat
              </motion.button>
            </div>
          </div>
        </div>
        
        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="h-64 sm:h-80 md:h-96 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 relative"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-800 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-2xl rounded-bl-none">
                <div className="flex space-x-1 items-center">
                  <span className="text-xs sm:text-sm mr-2">AI is typing</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Questions */}
        <div className="border-t border-gray-800 p-3 sm:p-4">
          <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
            {quickQuestions.map((question, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickQuestion(question)}
                className="bg-gray-800 text-white px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm hover:bg-gray-700 transition-all flex-shrink-0"
              >
                {question}
              </motion.button>
            ))}
          </div>
          
          {/* Input - FIXED: Mobile responsive input area */}
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 sm:gap-4">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask about outfits, styles, or occasions..."
              className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors text-sm sm:text-base min-w-0"
            />
            <motion.button
              onClick={handleSendMessage}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isTyping || inputMessage.trim() === ''}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1 sm:space-x-2 min-w-[80px] sm:min-w-[100px]"
            >
              <span className="text-sm sm:text-base">Send</span>
              {isTyping && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full"
                />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default AIChatAssistant;