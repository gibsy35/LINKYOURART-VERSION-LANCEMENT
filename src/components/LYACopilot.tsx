
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles, Zap, Loader2 } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

export const LYACopilot: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'USER' | 'AI', content: string }[]>([
    { role: 'AI', content: 'SYSTEM READY. HOW CAN I ASSIST YOUR TRADING OPERATIONS TODAY?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const inputMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'USER', content: inputMsg }]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          userMessage: inputMsg
        })
      });

      if (!response.ok) throw new Error('API_COMMUNICATION_ERROR');
      const data = await response.json();
      
      if (data.text) {
        setMessages(prev => [...prev, { role: 'AI', content: data.text }]);
      } else {
        throw new Error('NO_RESPONSE_DATA');
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'AI', content: 'SYSTEM_FAILURE: NEURAL_BRIDGE_OFFLINE. PLEASE RETRY COMMAND.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary-cyan text-surface-dim rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-[80] group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <MessageSquare size={20} className="relative z-10" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-surface-dim" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 bg-surface-dim border border-white/10 shadow-2xl z-[500] font-mono flex flex-col overflow-hidden h-[500px]"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-primary-cyan/5">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-primary-cyan" />
                <div>
                  <div className="text-[10px] font-black text-white uppercase tracking-tighter">LYA_COPILOT_v1.0</div>
                  <div className="text-[8px] text-primary-cyan font-bold uppercase tracking-widest animate-pulse">Online...</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-white"><X size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 text-[10px] font-bold leading-relaxed ${m.role === 'USER' ? 'bg-primary-cyan text-surface-dim shadow-[0_5px_15px_rgba(0,224,255,0.2)]' : 'bg-white/5 text-white border border-white/5'}`}>
                    <div className="flex items-center gap-2 mb-1 opacity-50">
                       {m.role === 'AI' ? <Sparkles size={10} /> : <Zap size={10} />}
                       <span>{m.role === 'AI' ? 'LYA_PILOT' : 'USER'}</span>
                    </div>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 p-3 rounded-sm flex items-center gap-2">
                    <Loader2 size={12} className="text-primary-cyan animate-spin" />
                    <span className="text-[8px] font-black uppercase text-primary-cyan tracking-widest animate-pulse">Processing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-white/10 bg-white/2">
              <div className="relative">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('ASK_LYA_COPILOT...', 'DEMANDER_À_LYA_COPILOT...')}
                  className="w-full bg-white/5 border border-white/10 p-3 pr-12 text-[10px] text-white focus:outline-none focus:border-primary-cyan font-bold"
                />
                <button onClick={handleSend} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-cyan hover:text-white transition-colors">
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
