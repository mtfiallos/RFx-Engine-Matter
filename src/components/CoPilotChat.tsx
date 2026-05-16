import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { generateChatResponse } from '../services/geminiService';
import { RfxSubmission } from '../services/rfxService';
// @ts-ignore
import Markdown from 'react-markdown';

export function CoPilotChat({ submission, onClose }: { submission: RfxSubmission | null, onClose: () => void }) {
  const [messages, setMessages] = useState<{role: 'user'|'model', content: string}[]>([{
    role: 'model', content: "Hi! I'm Ask Elyria, your Contextual Co-Pilot. I can answer questions about the uploaded documents in this bid and search your historical knowledge base. How can I help?"
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userQuery = input.trim();
    setInput('');
    const newMessages: any[] = [...messages, { role: 'user', content: userQuery }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // Create a context summary from the submission files and data
      let contextStr = "Context empty.";
      if (submission) {
        contextStr = `Current Submission Title: ${submission.title}\n`;
        contextStr += `Files attached: ${submission.data.files?.map(f => f.name).join(', ')}\n`;
        const reqSummary = (submission.data.requirements || []).slice(0, 10).map(r => r.text).join('\n');
        contextStr += `Sample Requirements from current bid:\n${reqSummary}\n`;
      }

      const prompt = `System Instructions: You are Ask Elyria, an enterprise proposal co-pilot. Use the provided context and your knowledge to answer the user's query thoughtfully.
      
      Context of current bid:
      ${contextStr}
      
      User query: ${userQuery}`;

      const chatHistory = newMessages.map(m => ({ role: m.role, content: m.content }));
      chatHistory[chatHistory.length - 1].content = prompt;

      const response = await generateChatResponse(chatHistory);
      setMessages([...newMessages, { role: 'model', content: response }]);
    } catch (e: any) {
      setMessages([...newMessages, { role: 'model', content: "An error occurred while generating the response." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 w-96 max-h-[600px] h-[80vh] bg-white border-2 border-slate-900 shadow-xl rounded-xl flex flex-col overflow-hidden z-50 text-sm"
    >
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h3 className="font-bold tracking-tight">Ask Elyria Co-Pilot</h3>
        </div>
        <button onClick={onClose} className="hover:rotate-90 transition-transform">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-slate-200 text-slate-700' : 'bg-blue-100 text-blue-700'}`}>
              {m.role === 'user' ? <UserIcon size={16}/> : <Bot size={16}/>}
            </div>
            <div className={`p-3 rounded-xl max-w-[80%] ${m.role === 'user' ? 'bg-slate-800 text-white rounded-tr-none' : 'bg-white border border-neutral-200 rounded-tl-none shadow-sm'}`}>
               <div className="prose prose-sm prose-invert prose-p:leading-tight prose-pre:bg-transparent">
                   <Markdown>{m.content}</Markdown>
               </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
               <Bot size={16} />
             </div>
             <div className="p-3 bg-white border border-neutral-200 rounded-xl rounded-tl-none flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-blue-600" />
                <span className="text-xs text-neutral-500">Elyria is thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-neutral-200 shrink-0">
        <div className="flex bg-neutral-100/50 border border-neutral-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-slate-900 focus-within:border-transparent transition-all">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about this bid or historical data..."
            className="flex-1 max-h-32 min-h-[44px] p-3 bg-transparent outline-none resize-none text-sm placeholder:text-neutral-400"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-3 text-blue-600 disabled:text-neutral-400 hover:text-blue-800 transition-colors flex items-center justify-center shrink-0 self-end"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
