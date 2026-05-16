import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, User, Paperclip } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function GoogleChatSimulator({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<{role: 'user'|'bot', content: string, attachments?: string[]}[]>([
    { role: 'bot', content: 'Hello! I am Elyria, your RFx AI assistant on Google Chat. Type "new submission" to begin a pipeline, or attach documents to an existing one.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    const lowerMsg = userMsg.toLowerCase();
    let reply = "Webhook received.";

    try {
        if (lowerMsg.includes('new submission')) {
          // Create submission
          if (!auth.currentUser) throw new Error("Not logged in");
          
          const titleMatch = userMsg.match(/new submission "?([^"]+)"?/i);
          const title = titleMatch && titleMatch[1] ? titleMatch[1] : "Chat Initiated RFx";

          const { createSubmission } = await import('../services/rfxService');
          const subId = await createSubmission(title, "Generated from Google Chat Integration");

          setActiveSubmissionId(subId || null);
          reply = `I've started a new submission pipeline: "${title}". You can reply with documents (e.g. "attach files") to ingest them.`;
        } else if (lowerMsg.includes('attach') || lowerMsg.includes('document') || lowerMsg.includes('file')) {
          if (activeSubmissionId) {
             reply = `Received artifacts to process for the open submission pipeline. They have been queued for ingestion.`;
          } else {
             reply = `Please start a 'new submission' first before attaching artifacts.`;
          }
        } else if (lowerMsg.includes('status')) {
          reply = "All active submission pipelines are nominal. Type 'new submission' to begin a new one.";
        } else {
          reply = `I didn't quite catch that. Try saying "new submission" to start an RFx pipeline, or ask for "status".`;
        }
    } catch(e: any) {
        reply = `System error: ${e.message}`;
    }

    setTimeout(() => {
       setMessages(prev => [...prev, { role: 'bot', content: reply }]);
       setIsTyping(false);
    }, 1000);
  };

  return (
    <motion.div 
       initial={{ opacity: 0, y: 50, scale: 0.9 }}
       animate={{ opacity: 1, y: 0, scale: 1 }}
       exit={{ opacity: 0, y: 50, scale: 0.9 }}
       className="fixed bottom-4 right-4 w-96 max-h-[600px] flex flex-col bg-[var(--card-bg)] rounded-2xl shadow-2xl border border-[var(--line)] z-50 overflow-hidden circuit-pattern"
       style={{ height: 'calc(100vh - 100px)' }}
    >
      <div className="bg-[var(--card-bg)] text-[var(--accent)] p-4 flex items-center justify-between border-b border-[var(--line)]">
         <div className="flex items-center gap-2">
            <MessageSquare size={18} className="drop-shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
            <span className="font-bold font-mono text-xs tracking-tighter">INTEGRATION // GOOGLE_CHAT</span>
         </div>
         <button onClick={onClose} className="p-1 hover:bg-[var(--accent)]/20 rounded-lg text-[var(--muted)] transition-colors">
            <X size={16} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--bg)]">
         {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-[var(--nav-bg)] text-[var(--accent)]' : 'bg-[var(--accent)] text-[var(--bg)]'}`}>
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
               </div>
               <div className={`p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-[var(--nav-bg)] text-[var(--ink)] border border-[var(--line)] rounded-tr-none' : 'bg-[var(--card-bg)] border border-[var(--accent)]/30 rounded-tl-none shadow-sm text-[var(--ink)]'}`}>
                  {m.content}
               </div>
            </div>
         ))}
         {isTyping && (
            <div className="flex gap-3">
               <div className="w-8 h-8 bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg flex items-center justify-center">
                  <Bot size={14} />
               </div>
               <div className="p-3 bg-[var(--card-bg)] border border-[var(--accent)]/20 rounded-2xl rounded-tl-none text-[var(--muted)] text-[10px] font-mono uppercase tracking-widest italic shadow-sm">
                  Receiving signal...
               </div>
            </div>
         )}
      </div>

      <div className="p-3 border-t border-[var(--line)] bg-[var(--nav-bg)]">
         <div className="flex gap-2">
            <input 
               type="text" 
               value={input} 
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSend()}
               placeholder="Remote input..."
               className="flex-1 p-2 bg-[var(--card-bg)] border border-[var(--line)] rounded-xl font-mono text-xs outline-none focus:border-[var(--accent)] text-[var(--ink)] placeholder:text-[var(--muted)]"
            />
            <button onClick={handleSend} disabled={isTyping} className="p-3 bg-[var(--accent)] text-[var(--bg)] rounded-xl hover:opacity-90 disabled:opacity-50 transition-all btn-energize">
               <Send size={16} />
            </button>
         </div>
      </div>
    </motion.div>
  );
}
