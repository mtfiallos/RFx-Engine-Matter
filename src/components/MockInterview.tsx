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
    <div className="bg-slate-50 border text-sm w-full flex flex-col relative" style={{ height: "600px" }}>
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
               <Bot size={16} />
            </div>
            <div>
               <h3 className="font-bold cursor-pointer hover:underline" onClick={() => setShowSettings(!showSettings)}>Red Team: Mock Interview</h3>
               <p className="text-xs text-slate-300 opacity-80 cursor-pointer hover:underline" onClick={() => setShowSettings(!showSettings)}>Procurement Officer Persona ({difficulty}, {focusArea})</p>
            </div>
         </div>
         <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-slate-800 rounded-full transition"><Settings size={16} /></button>
      </div>

      {showSettings && (
         <div className="absolute top-16 left-0 right-0 bg-white border-b shadow-lg z-10 p-4 flex flex-col gap-4">
            <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">Difficulty</label>
               <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full border p-2 rounded">
                  <option value="forgiving">Forgiving & Exploratory</option>
                  <option value="tough">Tough but Fair</option>
                  <option value="hostile">Hostile & Skeptical (Red Team Max)</option>
               </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 mb-1">Focus Area</label>
               <select value={focusArea} onChange={e => setFocusArea(e.target.value)} className="w-full border p-2 rounded">
                  <option value="general">General Overview</option>
                  <option value="technical depth">Technical Depth & Architecture</option>
                  <option value="commercial strategy">Commercial Strategy & Pricing</option>
                  <option value="compliance">Compliance & Security</option>
               </select>
            </div>
            <div className="flex justify-end gap-2">
               <button onClick={() => setShowSettings(false)} className="px-3 py-1.5 text-xs font-bold text-slate-500">Close</button>
               <button onClick={handleReset} className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded">Apply & Reset Session</button>
            </div>
         </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
         <AnimatePresence>
            {messages.map((msg, i) => (
                <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   key={i} 
                   className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'}`}>
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                   </div>
                   <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border text-slate-800 rounded-tl-none shadow-sm'}`}>
                      {msg.content}
                   </div>
                </motion.div>
            ))}
         </AnimatePresence>
         {isTyping && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[80%]">
                 <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                    <Bot size={14} />
                 </div>
                 <div className="p-4 rounded-2xl bg-white border text-slate-800 rounded-tl-none shadow-sm flex gap-1">
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 </div>
             </motion.div>
         )}
      </div>

      <div className="p-4 bg-white border-t">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
            <button type="button" className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
               <Mic size={18} />
            </button>
            <input 
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="Type your response..."
               className="flex-1 bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 rounded-full px-4 py-2 outline-none transition-all"
            />
            <button 
               type="submit"
               disabled={!input.trim() || isTyping}
               className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
               <Send size={16} />
            </button>
        </form>
      </div>
    </div>
  );
}
