
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, Sparkles, Zap, Loader2 } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import { askCopilot } from '../services/geminiService';

export const LYACopilot: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'USER' | 'AI', content: string }[]>([
    { role: 'AI', content: 'LYA_TERMINAL READY. SYSTEM STABILIZED. STATE YOUR ANALYTICAL REQUIREMENT.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    { title: t('What is LYA Score?', 'Qu\'est-ce que le Score LYA ?'), query: 'Explain how the LYA Score is calculated and what it represents.' },
    { title: t('P2P Exchange Fees', 'Frais d\'Échange P2P'), query: 'What are the fees for buying and selling creative units on the secondary market?' },
    { title: t('How to start?', 'Comment commencer ?'), query: 'How can I start investing in creative projects on LinkYourArt?' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (customQuery?: string) => {
    const queryToUse = customQuery || input;
    if (!queryToUse.trim() || isTyping) return;

    const inputMsg = queryToUse.trim();
    if (!customQuery) setInput('');
    
    const userMessage = { role: 'USER' as const, content: inputMsg };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const aiResponse = await askCopilot(inputMsg, messages);
      
      if (aiResponse) {
        setMessages(prev => [...prev, { role: 'AI', content: aiResponse }]);
      } else {
        setMessages(prev => [...prev, { role: 'AI', content: 'SYSTEM_FAILURE: NO_RESPONSE_RECEIVED.' }]);
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-cyan text-surface-dim rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,224,255,0.4)] hover:scale-105 active:scale-95 transition-all z-[999] group overflow-hidden border border-white/20"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <div className="relative z-10 flex flex-col items-center">
          <Bot size={24} />
          <span className="text-[8px] font-black uppercase tracking-widest mt-0.5">COPILOT</span>
        </div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full animate-pulse border border-surface-dim" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 40, scale: 0.95, filter: 'blur(10px)' }}
            className="fixed bottom-[5.5rem] right-4 sm:right-6 md:bottom-24 md:right-6 w-[calc(100vw-2rem)] sm:w-[calc(100vw-3rem)] md:w-[450px] bg-surface-dim/95 backdrop-blur-3xl border border-primary-cyan/20 shadow-[0_0_100px_rgba(0,0,0,0.8)] z-[1000] font-mono flex flex-col overflow-hidden h-[500px] sm:h-[600px] max-h-[75vh] sm:max-h-[80vh] rounded-3xl md:rounded-[2.5rem]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary-cyan/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-cyan/10 border border-primary-cyan/20 flex items-center justify-center text-primary-cyan shadow-[0_0_20px_rgba(0,224,255,0.2)]">
                  <Bot size={24} />
                </div>
                <div>
                  <div className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                    LYA_COPILOT_CORE
                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] rounded border border-emerald-500/20">LIVE v2.1</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <div className="text-[8px] text-primary-cyan font-bold uppercase tracking-[0.2em]">{t('NEURAL_BRIDGE_ACTIVE', 'PONT_NEURAL_ACTIF')}</div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/5 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-12">
              <div className="flex justify-center">
                <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-[0.3em] text-on-surface-variant/60">
                   {new Date().toLocaleDateString()} — {t('SECURE_SESSION_ENCRYPTED', 'SESSION_SÉCURISÉE_CHIFFRÉE')}
                </div>
              </div>

              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: m.role === 'USER' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`relative group max-w-[85%] ${m.role === 'USER' ? 'ml-12' : 'mr-12'}`}>
                    {m.role === 'AI' && (
                      <div className="absolute -left-2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-primary-cyan to-transparent opacity-40" />
                    )}
                    <div className={`p-4 rounded-2xl text-[11px] font-bold leading-relaxed shadow-2xl ${
                      m.role === 'USER' 
                        ? 'bg-primary-cyan text-surface-dim rounded-tr-none shadow-[0_10px_30px_rgba(0,224,255,0.2)]' 
                        : 'bg-white/5 text-white border border-white/5 rounded-tl-none backdrop-blur-xl'
                    }`}>
                      <div className="flex items-center gap-2 mb-2 opacity-50 text-[9px] uppercase tracking-widest font-black">
                         {m.role === 'AI' ? <Sparkles size={12} /> : <Zap size={12} />}
                         <span>{m.role === 'AI' ? 'LYA_TERMINAL' : 'USER_REQUEST'}</span>
                      </div>
                      {m.content}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/5 p-4 rounded-2xl rounded-tl-none flex flex-col gap-4 w-48">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary-cyan rounded-full" />
                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary-cyan rounded-full" />
                        <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary-cyan rounded-full" />
                      </div>
                      <span className="text-[8px] font-black uppercase text-primary-cyan tracking-widest animate-pulse">{t('THINKING...', 'ANALYSE...')}</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length < 3 && !isTyping && (
              <div className="px-6 py-2 flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s.query)}
                    className="px-3 py-1.5 bg-white/5 hover:bg-primary-cyan/10 border border-white/10 hover:border-primary-cyan/30 rounded-full text-[9px] font-bold text-on-surface-variant hover:text-primary-cyan transition-all uppercase tracking-widest"
                  >
                    {s.title}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-6 border-t border-white/5 bg-white/[0.02]">
              <div className="relative">
                <input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('INITIATE COMMAND...', 'INITIALISER COMMANDE...')}
                  disabled={isTyping}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-14 text-xs text-white focus:outline-none focus:border-primary-cyan/50 focus:bg-white/[0.08] transition-all font-mono font-bold placeholder:text-white/20 disabled:opacity-50"
                />
                <button 
                  onClick={() => handleSend()} 
                  disabled={isTyping || !input.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-primary-cyan text-surface-dim flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,224,255,0.3)] disabled:opacity-30 disabled:hover:scale-100"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-[7px] font-mono text-white/20 uppercase tracking-[0.4em]">
                <span>Neural Bridge Configured</span>
                <span className="w-1 h-1 bg-white/10 rounded-full" />
                <span>AES-256 Protocol</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
