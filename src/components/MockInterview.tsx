import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Mic, Settings } from 'lucide-react';
import { generateChatResponse } from '../services/geminiService';

export function MockInterview({ submission }: { submission: any }) {
  const [difficulty, setDifficulty] = useState('tough');
  const [focusArea, setFocusArea] = useState('general');
  const [showSettings, setShowSettings] = useState(false);

  const [messages, setMessages] = useState<{role: string, content: string}[]>([
     { role: 'assistant', content: "Hello. I am the acting Procurement Officer for this RFP. I've reviewed your submitted proposal. I'm going to ask you a few difficult questions about your approach to help your team prepare for the oral presentation. Type 'Start' when you're ready." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
     if (!input.trim() || isTyping) return;
     const newMessages = [...messages, { role: 'user', content: input }];
     setMessages(newMessages);
     setInput('');
     setIsTyping(true);

     try {
       // Inject the proposal context implicitly
       const reqSummary = submission?.data?.requirements?.slice(0, 5).map((r:any) => r.text).join(' ') || "";
       
       const aiResponse = await generateChatResponse([
          { role: 'system', content: `You are a Procurement Officer roleplaying a mock interview. Difficulty level: ${difficulty}. Focus area: ${focusArea}. Current bid context: ${submission.title}. Sample reqs: ${reqSummary}. Keep responses short and realistic.` },
          ...newMessages
       ]);
       setMessages([...newMessages, { role: 'assistant', content: aiResponse }]);
     } catch (e) {
       setMessages([...newMessages, { role: 'assistant', content: "Error communicating. Let's reschedule." }]);
     }
     setIsTyping(false);
  };

  const handleReset = () => {
      setMessages([{ role: 'assistant', content: `Settings updated. I will focus on ${focusArea} with a ${difficulty} demeanor. Shall we begin?` }]);
      setShowSettings(false);
  };

  return (
    <div className="bg-[var(--bg)] border border-[var(--line)] text-sm w-full flex flex-col relative rounded-2xl overflow-hidden shadow-2xl" style={{ height: "600px" }}>
      <div className="bg-[#020617] text-[var(--accent)] p-5 flex items-center justify-between border-b border-[var(--line)]">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-950/50 border border-red-500/50 rounded-lg flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
               <Bot size={20} />
            </div>
            <div>
               <h3 className="font-bold cursor-pointer hover:text-white transition-colors tracking-tight font-sans uppercase text-sm" onClick={() => setShowSettings(!showSettings)}>Red Team: Session</h3>
               <p className="text-[10px] font-mono text-red-400 opacity-80 cursor-pointer hover:underline uppercase tracking-widest" onClick={() => setShowSettings(!showSettings)}>Procurement: {difficulty} // {focusArea}</p>
            </div>
         </div>
         <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-white/5 rounded-full transition text-[var(--muted)] hover:text-[var(--accent)]"><Settings size={18} /></button>
      </div>

      {showSettings && (
         <div className="absolute top-20 left-4 right-4 bg-[#0f172a] border border-[var(--accent)]/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,1)] z-50 p-6 flex flex-col gap-5 backdrop-blur-md">
            <h4 className="text-[10px] font-mono font-bold text-[var(--accent)] uppercase tracking-[0.3em] mb-2">Simulation Parameters</h4>
            <div className="space-y-4">
              <div>
                 <label className="block text-[10px] font-bold text-[var(--muted)] mb-2 uppercase font-mono">Demeanor Bias</label>
                 <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-[#020617] border border-[var(--line)] text-[var(--ink)] p-3 rounded-xl focus:border-[var(--accent)] outline-none appearance-none font-mono text-xs cursor-pointer">
                    <option value="forgiving">Forgiving & Exploratory</option>
                    <option value="tough">Tough but Fair</option>
                    <option value="hostile">Hostile & Skeptical (Red Team Max)</option>
                 </select>
              </div>
              <div>
                 <label className="block text-[10px] font-bold text-[var(--muted)] mb-2 uppercase font-mono">Focus Vector</label>
                 <select value={focusArea} onChange={e => setFocusArea(e.target.value)} className="w-full bg-[#020617] border border-[var(--line)] text-[var(--ink)] p-3 rounded-xl focus:border-[var(--accent)] outline-none appearance-none font-mono text-xs cursor-pointer">
                    <option value="general">General Overview</option>
                    <option value="technical depth">Technical Depth & Architecture</option>
                    <option value="commercial strategy">Commercial Strategy & Pricing</option>
                    <option value="compliance">Compliance & Security</option>
                 </select>
              </div>
            </div>
            <div className="flex justify-end gap-4 mt-2">
               <button onClick={() => setShowSettings(false)} className="px-5 py-2 text-xs font-bold text-[var(--muted)] uppercase font-mono tracking-wider hover:text-[var(--ink)]">Cancel</button>
               <button onClick={handleReset} className="px-6 py-2 text-xs font-black text-[var(--bg)] bg-[var(--accent)] rounded-full shadow-[0_0_15px_var(--accent-glow)] btn-energize uppercase font-mono">Reinitialize Session</button>
            </div>
         </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0f172a]/30">
         <AnimatePresence>
            {messages.map((msg, i) => (
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   key={i} 
                   className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                   <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-[#1e293b] text-[var(--accent)] border border-[var(--line)]' : 'bg-red-500 text-white'}`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                   </div>
                   <div className={`p-4 rounded-2xl text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-[#1e293b] text-[var(--ink)] border border-[var(--line)] shadow-lg rounded-tr-none' : 'bg-[#0f172a] border border-red-500/20 text-[var(--ink)] rounded-tl-none shadow-[0_0_15px_rgba(239,68,68,0.05)]'}`}>
                      {msg.content}
                   </div>
                </motion.div>
            ))}
         </AnimatePresence>
         {isTyping && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[80%]">
                 <div className="w-9 h-9 rounded-lg bg-red-900/50 text-red-500 border border-red-500/30 flex items-center justify-center shrink-0">
                    <Bot size={16} />
                 </div>
                 <div className="p-4 rounded-2xl bg-[#0f172a] border border-red-500/20 text-[var(--muted)] rounded-tl-none shadow-sm flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 </div>
             </motion.div>
         )}
      </div>

      <div className="p-4 bg-[#020617] border-t border-[var(--line)]">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3">
            <button type="button" className="p-3 text-[var(--muted)] hover:text-[var(--accent)] hover:bg-white/5 rounded-full transition-all">
               <Mic size={20} />
            </button>
            <input 
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Transmit response..."
               className="flex-1 bg-[#0f172a] border border-[var(--line)] focus:border-[var(--accent)] rounded-full px-5 py-3 outline-none transition-all text-sm text-[var(--ink)] placeholder:text-[var(--muted)] font-mono"
            />
            <button 
               type="submit"
               disabled={!input.trim() || isTyping}
               className="p-3 bg-[var(--accent)] text-[var(--bg)] rounded-full shadow-[0_0_15px_var(--accent-glow)] hover:scale-110 active:scale-95 disabled:opacity-30 transition-all btn-energize"
            >
               <Send size={20} />
            </button>
        </form>
      </div>
    </div>
  );
}
