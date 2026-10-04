import React, { useState, useRef, useEffect } from 'react';
import { aiApi } from '../../api/axios';
import { Bot, Send, Trash2, Sparkles, User, HelpCircle, Loader2 } from 'lucide-react';

const initialSuggestions = [
  'What is the company leave policy?',
  'What are the core working hours and attendance rules?',
  'How is Net Salary calculated?',
  'What health insurance benefits are provided?',
  'What is the notice period and probation duration?',
];

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your **AI-EMS HR Assistant**. I can answer questions about leave allocations, attendance regulations, monthly payroll, appraisals, health insurance, and workplace ethics. How can I assist you today?",
      suggestions: initialSuggestions,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiApi.post('/api/ai/chat', { message: textToSend });
      const aiReply = {
        sender: 'ai',
        text: res.data.reply,
        suggestions: res.data.suggestions || [],
      };
      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: "I'm having trouble connecting to the AI Microservice. Please ensure the Python service is running on port 5000.",
          suggestions: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: "Chat cleared! How can I assist you with HR policies today?",
        suggestions: initialSuggestions,
      },
    ]);
  };

  return (
    <div className="chatbot-page">
      <div className="page-header-row">
        <div>
          <h2>AI HR Assistant Bot</h2>
          <p className="page-header-sub">
            24/7 automated guidance on employee policies, leave quotas, working hours, and benefits
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleClearChat}>
          <Trash2 size={16} /> Clear Chat
        </button>
      </div>

      <div className="chat-container-card">
        {/* Chat Messages */}
        <div className="chat-messages-area">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble-row ${msg.sender === 'user' ? 'bubble-user' : 'bubble-ai'}`}>
              <div className="chat-avatar">
                {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className="chat-content-box">
                <div className="chat-bubble-text">
                  {msg.text.split('\n').map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>

                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="chat-suggestions-wrap">
                    <span className="suggestions-label">
                      <HelpCircle size={14} /> Suggested inquiries:
                    </span>
                    <div className="suggestions-chips">
                      {msg.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="suggestion-chip"
                          onClick={() => handleSend(s)}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble-row bubble-ai">
              <div className="chat-avatar">
                <Bot size={18} />
              </div>
              <div className="chat-content-box loading-indicator-bubble">
                <Loader2 size={18} className="spinner-icon" />
                <span>AI HR is consulting company policy...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="chat-input-bar"
        >
          <input
            type="text"
            placeholder="Type your HR or workplace query (e.g., 'How many days of sick leave do I get?')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary chat-send-btn" disabled={loading || !input.trim()}>
            <Send size={18} /> Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
