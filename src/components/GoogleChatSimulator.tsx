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
       className="fixed bottom-4 right-4 w-96 max-h-[600px] flex flex-col bg-white rounded-xl shadow-2xl border border-neutral-200 z-50 overflow-hidden"
       style={{ height: 'calc(100vh - 100px)' }}
    >
      <div className="bg-green-700 text-white p-3 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <MessageSquare size={18} />
            <span className="font-bold text-sm">Google Chat SIMULATOR</span>
         </div>
         <button onClick={onClose} className="p-1 hover:bg-green-600 rounded">
            <X size={16} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
         {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
               </div>
               <div className={`p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border rounded-tl-none shadow-sm text-slate-800'}`}>
                  {m.content}
               </div>
            </div>
         ))}
         {isTyping && (
            <div className="flex gap-3">
               <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">
                  <Bot size={14} />
               </div>
               <div className="p-3 bg-white border rounded-lg rounded-tl-none text-slate-500 text-xs italic shadow-sm">
                  Elyria is typing...
               </div>
            </div>
         )}
      </div>

      <div className="p-3 border-t bg-white">
         <div className="flex gap-2">
            <input 
               type="text" 
               value={input} 
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSend()}
               placeholder="Type test message..."
               className="flex-1 p-2 border rounded font-mono text-sm outline-none focus:border-green-600"
            />
            <button onClick={handleSend} disabled={isTyping} className="p-2 bg-green-700 text-white rounded hover:bg-green-800 disabled:opacity-50">
               <Send size={16} />
            </button>
         </div>
         <p className="text-[10px] text-center text-slate-400 mt-2">
           Simulates inbound webhook to /api/webhooks/google-chat
         </p>
      </div>
    </motion.div>
  );
}
