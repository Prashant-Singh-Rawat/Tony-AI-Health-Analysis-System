import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, BrainCircuit } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI Health Assistant. How can I help you understand your reports or find services today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Simulate quick clinical LLM response structure (in production, wires directly to backend LLM route)
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Regarding your query about "${userMsg}": To provide precise advice, you can upload your lab reports directly to our Report Analysis portal. If this is an emergency, please use our Call support immediately.`
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="w-[360px] sm:w-[400px] h-[520px] bg-white dark:bg-gray-950 border border-red-50/20 dark:border-gray-800 rounded-3xl shadow-floating overflow-hidden flex flex-col mb-4"
          >
            {/* Header */}
            <div className="bg-gray-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm flex items-center gap-1">
                    Tony Health AI <Sparkles className="w-3.5 h-3.5 text-brand" />
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Online & Verified</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((m, idx) => {
                const isAssistant = m.role === 'assistant';
                return (
                  <div key={idx} className={`flex items-start gap-2.5 ${!isAssistant ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isAssistant ? 'bg-red-50 text-brand' : 'bg-gray-900 text-white'}`}>
                      {isAssistant ? 'AI' : 'U'}
                    </div>
                    <div className={`max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${isAssistant ? 'bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-tl-sm' : 'bg-brand text-white rounded-tr-sm'}`}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-gray-900 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask health assistant..."
                className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-850 px-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand text-gray-800 dark:text-white placeholder-gray-400 font-semibold"
              />
              <button
                type="submit"
                className="bg-brand text-white p-3 rounded-xl hover:bg-brand-dark transition shadow-md shadow-red-200 dark:shadow-none flex-shrink-0"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand text-white rounded-full flex items-center justify-center shadow-floating shadow-red-300 dark:shadow-none hover:bg-brand-dark transition-all duration-300 border border-brand/10"
        aria-label="Toggle chat widget"
      >
        <MessageSquare className="w-6 h-6 fill-white" />
      </motion.button>
    </div>
  );
}
