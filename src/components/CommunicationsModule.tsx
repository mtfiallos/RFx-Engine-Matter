import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Search, RefreshCw, Archive, Settings, Check } from 'lucide-react';
import { InboundEmail, getInboundEmails, updateInboundEmailStatus } from '../services/communicationsService';

export function CommunicationsModule({ userEmail, platformIntegrations, onConfigure }: { userEmail: string | undefined, platformIntegrations: any[], onConfigure: () => void }) {
  const [emails, setEmails] = useState<InboundEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleMarkAsHandled = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      await updateInboundEmailStatus(id, 'handled');
      await fetchEmails();
  };

  const handleMarkAsRead = async (id: string) => {
      const target = emails.find(e => e.id === id);
      if(target && target.status === 'unread') {
          await updateInboundEmailStatus(id, 'read');
          await fetchEmails();
      }
  };

  if (!emailIntegration) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-12 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mb-6">
          <Mail size={32} />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Systems Email Gateway</h2>
        <p className="text-slate-600 mb-8 max-w-md">
          Configure a dedicated inbound email address for your Elyria system. This enables the engine to automatically receive, parse, and route RFx communications, addenda, and Q&A directly into your project workflow.
        </p>
        <button 
          onClick={onConfigure}
          className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <Settings size={18} />
          Configure Platform Integrations
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pt-8 px-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 tracking-tighter">Inbound Communications</h2>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            System Address: <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200">{emailIntegration.config?.emailAddress || 'pending...'}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
            <Search size={18} />
          </button>
          <button onClick={fetchEmails} className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden flex-1 mb-8">
        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 text-neutral-400 gap-4">
            <RefreshCw className="animate-spin text-blue-500" size={32} />
            Checking inbound gateway...
          </div>
        ) : emails.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {emails.map((email) => (
              <div 
                key={email.id} 
                className={`flex items-start p-4 hover:bg-slate-50 cursor-pointer transition-colors ${email.status === 'unread' ? 'bg-blue-50/30' : ''}`}
                onClick={() => handleMarkAsRead(email.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium ${email.status === 'unread' ? 'text-slate-900 font-bold' : email.status === 'handled' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {email.from}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(email.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h4 className={`text-sm mb-1 ${email.status === 'unread' ? 'text-slate-900 font-bold' : email.status === 'handled' ? 'text-slate-400' : 'text-slate-800'}`}>
                    {email.subject}
                  </h4>
                  <p className={`text-sm truncate whitespace-nowrap ${email.status === 'handled' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {email.snippet}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {email.status !== 'handled' && (
                    <button 
                      onClick={(e) => handleMarkAsHandled(email.id, e)} 
                      className="p-1.5 text-slate-400 hover:text-green-600 rounded bg-white border border-slate-200 hover:border-green-300 shadow-sm"
                      title="Mark as Handled"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded bg-white border border-slate-200 hover:border-slate-300 shadow-sm">
                    <Archive size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center h-64 text-neutral-400 gap-4">
            <Mail size={48} className="opacity-20" />
            <p>No new communications received.</p>
          </div>
        )}
      </div>
    </div>
  );
}
