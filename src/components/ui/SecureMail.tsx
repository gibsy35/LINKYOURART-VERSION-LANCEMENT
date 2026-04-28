
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Shield, Lock, Paperclip, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

interface SecureMailProps {
  isOpen: boolean;
  onClose: () => void;
  recipient?: { name: string, role: string } | null;
  onSend: (data: any) => void;
}

export const SecureMail: React.FC<SecureMailProps> = ({ isOpen, onClose, recipient, onSend }) => {
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      onSend({ subject, message, recipient });
      setTimeout(() => {
        setIsSent(false);
        onClose();
      }, 2000);
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface-dim/95 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-surface-dim border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden font-mono"
          >
            {/* Security Header */}
            <div className="bg-primary-cyan/5 p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border border-primary-cyan flex items-center justify-center text-primary-cyan shadow-[0_0_15px_rgba(0,224,255,0.2)]">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase italic tracking-tighter">
                    {t('SECURE_MAIL_GATEWAY', 'PASSERELLE_MAIL_SÉCURISÉE')}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">{t('ENCRYPTION: AES-256 ACTIVE', 'CHIFFREMENT : AES-256 ACTIF')}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-on-surface-variant hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Recipient Info */}
              <div className="flex items-center justify-between p-4 bg-white/2 border border-white/5">
                <div>
                  <div className="text-[9px] text-on-surface-variant/40 font-black uppercase tracking-widest mb-1">{t('RECIPIENT_IDENTITY', 'IDENTITÉ_DESTINATAIRE')}</div>
                  <div className="text-xs font-black text-white uppercase italic tracking-tight">{recipient?.name || t('SELECT_RECIPIENT', 'SÉLECTIONNER_DESTINATAIRE')}</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] text-primary-cyan font-black uppercase tracking-widest mb-1">{t('PROTOCOL_LEVEL', 'NIVEAU_PROTOCOLE')}</div>
                  <div className="text-[10px] font-black text-white/60">{recipient?.role || '---'}</div>
                </div>
              </div>

              {/* Input Fields */}
              <div className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    placeholder={t('SUBJECT_LINE...', 'OBJET...')}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white/5 border-b border-white/10 p-4 text-[11px] text-white uppercase font-black focus:outline-none focus:border-primary-cyan transition-colors"
                  />
                </div>
                <div className="relative">
                  <textarea 
                    rows={8}
                    placeholder={t('COMMENCE_ENCRYPTED_MESSAGE...', 'COMMENCER_LE_MESSAGE_CHIFFRÉ...')}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white/2 border border-white/5 p-6 text-[11px] text-white leading-relaxed focus:outline-none focus:border-primary-cyan/30 transition-colors resize-none"
                  />
                  <div className="absolute bottom-4 right-4 flex items-center gap-4">
                    <button className="text-on-surface-variant/40 hover:text-white transition-colors">
                      <Paperclip size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action */}
              <button 
                onClick={handleSend}
                disabled={isSending || isSent || !message.trim()}
                className={`w-full py-5 flex items-center justify-center gap-4 transition-all relative overflow-hidden ${
                  isSent ? 'bg-emerald-500 text-surface-dim' : 
                  isSending ? 'bg-primary-cyan/20 text-primary-cyan cursor-wait' : 
                  'bg-primary-cyan text-surface-dim hover:bg-white active:scale-[0.98]'
                }`}
              >
                {isSending ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Lock size={18} />
                    </motion.div>
                    <span className="text-[11px] font-black uppercase italic tracking-widest">{t('ENCRYPTING_AND_TRANSMITTING...', 'CHIFFREMENT_ET_TRANSMISSION...')}</span>
                  </>
                ) : isSent ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span className="text-[11px] font-black uppercase italic tracking-widest">{t('TRANSMISSION_SUCCESSFUL', 'TRANSMISSION_RÉUSSIE')}</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span className="text-[11px] font-black uppercase italic tracking-widest">{t('EXECUTE_SECURE_SEND', 'LANCER_L\'ENVOI_SÉCURISÉ')}</span>
                  </>
                )}
              </button>

              <p className="text-[8px] text-on-surface-variant/20 text-center uppercase tracking-widest font-black italic">
                {t('BY_EXECUTING_THIS_SEND_YOU_AGREE_TO_OUR_INSTITUTIONAL_COMMUNICATION_PROTOCOL_V2.1', 'EN_EXÉCUTANT_CET_ENVOI_VOUS_ACCEPTEZ_NOTRE_PROTOCOLE_DE_COMMUNICATION_INSTITUTIONNEL_V2.1')}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
