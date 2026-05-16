import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Search, RefreshCw, Archive, Settings, Check, Trash2, Reply, X, ArrowLeft, Send } from 'lucide-react';
import { InboundEmail, getInboundEmails, updateInboundEmailStatus, deleteInboundEmail } from '../services/communicationsService';

export function CommunicationsModule({ userEmail, platformIntegrations, onConfigure }: { userEmail: string | undefined, platformIntegrations: any[], onConfigure: () => void }) {
  const [emails, setEmails] = useState<InboundEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<InboundEmail | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Check if Email Inbound integration exists
  const emailIntegration = platformIntegrations.find(i => i.type === 'EMAIL_INBOUND' && i.status === 'ACTIVE');

  const fetchEmails = async () => {
      if (emailIntegration) {
          setIsLoading(true);
          try {
              const data = await getInboundEmails();
              setEmails(data);
          } catch(e) {
              console.error(e);
          } finally {
              setIsLoading(false);
          }
      }
  };

  useEffect(() => {
    fetchEmails();
  }, [emailIntegration]);

  const handleMarkAsHandled = async (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      await updateInboundEmailStatus(id, 'handled');
      await fetchEmails();
      if (selectedEmail?.id === id) {
          setSelectedEmail(prev => prev ? { ...prev, status: 'handled' } : null);
      }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (window.confirm('Are you sure you want to delete this communication?')) {
          await deleteInboundEmail(id);
          await fetchEmails();
          if (selectedEmail?.id === id) {
              setSelectedEmail(null);
          }
      }
  };

  const handleMarkAsRead = async (email: InboundEmail) => {
      setSelectedEmail(email);
      if(email.status === 'unread') {
          await updateInboundEmailStatus(email.id, 'read');
          await fetchEmails();
      }
  };

  const handleSendReply = () => {
      if (!replyText.trim()) return;
      alert(`Reply sent to ${selectedEmail?.from}: ${replyText}`);
      setReplyText('');
      setIsReplying(false);
      handleMarkAsHandled(selectedEmail!.id);
  };

  if (!emailIntegration) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center max-w-2xl mx-auto text-[var(--ink)]">
        <div className="w-16 h-16 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(100,255,218,0.2)]">
          <Mail size={32} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2 uppercase font-sans">Systems Email Gateway</h2>
        <p className="text-[var(--muted)] mb-8 max-w-md font-mono text-sm">
          Configure a dedicated inbound email address for your Elyria system. This enables the engine to automatically receive, parse, and route RFx communications, addenda, and Q&A directly into your project workflow.
        </p>
        <button 
          onClick={onConfigure}
          className="bg-[var(--accent)] text-[var(--bg)] px-8 py-4 rounded-xl font-mono font-bold uppercase shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Settings size={18} />
          Initialize Gateway
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-8 px-8 max-w-[1600px] mx-auto overflow-hidden">
      <AnimatePresence mode="wait">
        {!selectedEmail ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-full overflow-hidden"
          >
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-[var(--ink)] tracking-tighter uppercase font-sans">Inbound Communications</h2>
                <p className="text-[var(--muted)] mt-1 flex items-center gap-2 font-mono text-xs">
                  System Address: <span className="font-bold text-[var(--accent)]">{emailIntegration.config?.emailAddress || 'pending...'}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-[var(--line)] rounded-lg hover:bg-white/5 text-[var(--muted)] transition-colors">
                  <Search size={18} />
                </button>
                <button onClick={fetchEmails} className="p-2 border border-[var(--line)] rounded-lg hover:bg-white/5 text-[var(--muted)] transition-colors">
                  <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            <div className="bento-card !p-0 flex-1 mb-8 overflow-hidden flex flex-col border border-[var(--line)]">
              {isLoading ? (
                <div className="flex flex-col justify-center items-center h-64 text-[var(--muted)] gap-4">
                  <RefreshCw className="animate-spin text-[var(--accent)]" size={32} />
                  <span className="font-mono text-xs uppercase tracking-widest">Checking inbound gateway...</span>
                </div>
              ) : emails.length > 0 ? (
                <div className="divide-y divide-[var(--line)] overflow-y-auto">
                  {emails.map((email) => (
                    <div 
                      key={email.id} 
                      className={`group flex items-start p-6 hover:bg-white/5 cursor-pointer transition-colors ${email.status === 'unread' ? 'bg-[var(--accent)]/5' : ''}`}
                      onClick={() => handleMarkAsRead(email)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-mono text-xs uppercase ${email.status === 'unread' ? 'text-[var(--accent)] font-bold' : email.status === 'handled' ? 'text-[var(--muted)] line-through' : 'text-[var(--ink)] opacity-70'}`}>
                            {email.from}
                          </span>
                          <span className="font-mono text-[10px] text-[var(--muted)]">
                            {new Date(email.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <h4 className={`text-lg mb-1 font-sans ${email.status === 'unread' ? 'text-[var(--ink)] font-bold' : email.status === 'handled' ? 'text-[var(--muted)]' : 'text-[var(--ink)] opacity-90'}`}>
                          {email.subject}
                        </h4>
                        <p className={`text-sm truncate font-mono ${email.status === 'handled' ? 'text-[var(--muted)]' : 'text-[var(--muted)] opacity-80'}`}>
                          {email.snippet}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {email.status !== 'handled' && (
                          <button 
                            onClick={(e) => handleMarkAsHandled(email.id, e)} 
                            className="p-2 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)] rounded-lg border border-[var(--accent)]/20 transition-all"
                            title="Mark as Handled"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button 
                          onClick={(e) => handleDelete(email.id, e)}
                          className="p-2 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all font-mono"
                          title="Delete Communication"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center h-64 text-[var(--muted)] gap-4">
                  <Mail size={48} className="opacity-10" />
                  <p className="font-mono text-xs uppercase tracking-widest">No new communications received.</p>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="viewer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => { setSelectedEmail(null); setIsReplying(false); }}
                className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--ink)] transition-colors font-mono text-xs uppercase font-bold"
              >
                <ArrowLeft size={16} /> Back to Inbox
              </button>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsReplying(!isReplying)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-[10px] font-bold uppercase transition-all ${isReplying ? 'bg-[var(--accent)] text-[var(--bg)]' : 'border border-[var(--line)] text-[var(--ink)] hover:bg-white/5'}`}
                >
                  <Reply size={14} /> {isReplying ? 'Cancel Reply' : 'Reply'}
                </button>
                {selectedEmail.status !== 'handled' && (
                  <button 
                    onClick={() => handleMarkAsHandled(selectedEmail.id)}
                    className="flex items-center gap-2 px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg font-mono text-[10px] font-bold uppercase hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-all"
                  >
                    <Check size={14} /> Resolve
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(selectedEmail.id)}
                  className="p-2 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
              <div className="bento-card border border-[var(--line)]">
                <div className="flex justify-between items-start mb-6 border-b border-[var(--line)] pb-6">
                  <div>
                    <h1 className="text-2xl font-bold font-sans text-[var(--ink)] mb-2 uppercase tracking-tight">{selectedEmail.subject}</h1>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold text-xs uppercase">
                        {selectedEmail.from[0]}
                      </div>
                      <div>
                        <p className="font-mono text-xs text-[var(--ink)] font-bold">{selectedEmail.from}</p>
                        <p className="font-mono text-[10px] text-[var(--muted)] uppercase">{new Date(selectedEmail.date).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full font-mono text-[9px] font-bold uppercase tracking-widest ${selectedEmail.status === 'unread' ? 'bg-[var(--accent)] text-[var(--bg)]' : 'bg-white/10 text-[var(--muted)]'}`}>
                      {selectedEmail.status}
                    </span>
                  </div>
                </div>

                <div className="font-sans text-[var(--ink)] leading-relaxed whitespace-pre-wrap opacity-90 text-base">
                  {selectedEmail.body || selectedEmail.snippet}
                </div>
              </div>

              <AnimatePresence>
                {isReplying && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="bento-card border border-[var(--accent)]/30 !bg-[var(--card-bg)] shadow-[0_0_30px_rgba(100,255,218,0.1)]"
                  >
                    <div className="flex items-center gap-2 mb-4 text-[var(--accent)] font-mono text-xs uppercase font-bold">
                      <Reply size={16} /> Composing Response to {selectedEmail.from}
                    </div>
                    <textarea 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response here..."
                      className="w-full h-48 bg-white/5 border border-[var(--line)] rounded-xl p-4 text-[var(--ink)] font-sans resize-none focus:border-[var(--accent)] outline-none transition-colors mb-4"
                    />
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setIsReplying(false)}
                        className="px-6 py-2 rounded-lg font-mono text-[10px] font-bold uppercase text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                      >
                        Discard
                      </button>
                      <button 
                        onClick={handleSendReply}
                        className="flex items-center gap-2 px-8 py-2 bg-[var(--accent)] text-[var(--bg)] rounded-lg font-mono text-[10px] font-bold uppercase hover:opacity-90 transition-all shadow-lg"
                      >
                        <Send size={14} /> Send Message
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
