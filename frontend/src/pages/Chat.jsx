import { useState, useRef, useEffect } from 'react';
import { Card, Button, Badge } from '../components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Send, Paperclip, Mic, Copy, Share2, Download,
  Sparkles, Bot, User, Check, AlertCircle, RefreshCw, Star
} from 'lucide-react';

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: 'Hello! I am **Tony**, your medical AI companion. I can analyze uploaded reports, outline symptom correlations, or provide wellness guidance. What is on your mind today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agent, setAgent] = useState('general');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const agents = [
    { id: 'general', name: 'General Health Agent', desc: 'Symptom checker & general health advice' },
    { id: 'cardiologist', name: 'CardioAI Expert', desc: 'Heart rate, lipid panel, and blood pressure' },
    { id: 'dietician', name: 'Diet & Nutritionist', desc: 'Meal planners & caloric index calculations' }
  ];

  const suggestions = [
    'How do I lower my cholesterol?',
    'What does high blood pressure mean?',
    'Create a simple 3-day cardiac diet plan.'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const messageText = textToSend || input;
    if (!messageText.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate Streaming reply
    setTimeout(() => {
      setIsTyping(false);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: `Here is some information regarding **"${messageText}"**:\n\n*   **Guidance:** Make sure to consult with a licensed professional.\n*   **Next Steps:** You can upload your PDF report in the **Health Analysis** tab to cross-reference real metrics.\n*   **Disclaimer:** AI results are educational resources, not official diagnoses.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1500);
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6"
    >
      {/* Left Chat Window */}
      <div className="flex-1 flex flex-col bg-bg-surface border border-border-subtle rounded-3xl overflow-hidden shadow-xl">
        {/* Header/Agent Selector */}
        <div className="p-4 border-b border-border-subtle bg-bg-surface-hover/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-text-main text-sm">Tony AI Assistant</h3>
              <p className="text-[10px] text-text-muted">Powered by Gemini 2.5 Flash</p>
            </div>
          </div>
          <select
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
            className="px-3 py-1.5 bg-bg-base border border-border-subtle rounded-xl text-xs font-semibold text-text-main outline-none focus:border-brand-primary"
          >
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className="space-y-1.5 max-w-[80%]">
                  <div
                    className={`p-4 rounded-2xl text-sm leading-relaxed border ${
                      msg.sender === 'user'
                        ? 'bg-brand-primary text-white border-brand-primary/20 rounded-tr-none'
                        : 'bg-bg-base text-text-main border-border-subtle rounded-tl-none'
                    }`}
                  >
                    {/* Simplified markdown formatter for bolding */}
                    {msg.text.split('\n').map((para, i) => (
                      <p key={i} className="mb-2 last:mb-0">
                        {para.split('**').map((part, idx) =>
                          idx % 2 === 1 ? <strong key={idx} className="font-extrabold">{part}</strong> : part
                        )}
                      </p>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 px-1">
                    <span className="text-[10px] text-text-muted">{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopy(msg.id, msg.text)}
                          className="p-1 hover:bg-bg-surface-hover rounded text-text-muted hover:text-text-main transition-colors"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <button className="p-1 hover:bg-bg-surface-hover rounded text-text-muted hover:text-text-main transition-colors">
                          <Share2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-brand-secondary/15 flex items-center justify-center text-brand-secondary flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-bg-base border border-border-subtle p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 bg-text-muted rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border-subtle bg-bg-surface-hover/20 space-y-3">
          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s)}
                  className="px-3 py-1.5 bg-bg-base hover:bg-bg-surface-hover border border-border-subtle rounded-xl text-xs text-text-muted hover:text-text-main font-semibold transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 bg-bg-base border border-border-subtle rounded-xl p-1.5 focus-within:border-brand-primary transition-colors">
            <button className="p-2 hover:bg-bg-surface-hover rounded-lg text-text-muted hover:text-text-main transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              placeholder="Ask about vitals, lab reports, or nutritional diets..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent text-sm text-text-main placeholder-text-muted outline-none px-2"
            />
            <button className="p-2 hover:bg-bg-surface-hover rounded-lg text-text-muted hover:text-text-main transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <Button
              onClick={() => handleSend()}
              variant="primary"
              className="p-2 rounded-lg bg-brand-primary text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Agent Metadata & Clinical Reminders */}
      <div className="w-full md:w-64 space-y-6">
        <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
          <h4 className="text-sm font-extrabold text-text-main flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-primary" /> Copilot Agent Info
          </h4>
          <p className="text-xs text-text-muted mt-2">
            Currently utilizing the <span className="font-bold text-text-main">{agents.find(a => a.id === agent)?.name}</span> model logic.
          </p>
          <div className="mt-4 border-t border-border-subtle pt-3 text-[11px] text-text-muted leading-relaxed">
            {agents.find(a => a.id === agent)?.desc}
          </div>
        </Card>

        <Card>
          <h4 className="text-xs font-bold text-text-main uppercase tracking-wider mb-3">Suggested Checks</h4>
          <div className="space-y-3.5 text-xs">
            <div className="flex gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-text-muted leading-relaxed">Ensure you upload your CBC report for hematology analysis.</p>
            </div>
            <div className="flex gap-2">
              <Star className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <p className="text-text-muted leading-relaxed">Analyze metabolic trend correlations over 3 previous months.</p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
