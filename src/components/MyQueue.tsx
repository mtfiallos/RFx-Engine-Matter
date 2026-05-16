import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RfxSubmission, Requirement, Risk, Assumption } from '../services/rfxService';
import { CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export function MyQueue({ submissions, userEmail, isFullWidth = false }: { submissions: RfxSubmission[], userEmail?: string | null, isFullWidth?: boolean }) {
  const [myTasks, setMyTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!userEmail) return;

    // Scan all submissions for items assigned to this user
    const tasks: any[] = [];
    submissions.forEach(sub => {
      sub.data.requirements?.forEach(r => {
        if (r.assignedTo === userEmail) {
          tasks.push({ ...r, submissionId: sub.id, submissionTitle: sub.title, itemType: 'requirement' });
        }
      });
      sub.data.risks?.forEach(r => {
        if (r.assignedTo === userEmail) {
          tasks.push({ ...r, submissionId: sub.id, submissionTitle: sub.title, itemType: 'risk' });
        }
      });
      sub.data.assumptions?.forEach(r => {
        if (r.assignedTo === userEmail) {
          tasks.push({ ...r, submissionId: sub.id, submissionTitle: sub.title, itemType: 'assumption' });
        }
      });
    });

    setMyTasks(tasks);
  }, [submissions, userEmail]);

  if (!userEmail) {
    return <div className="p-8 text-center text-[var(--muted)]">Please sign in to view your queue.</div>;
  }

  return (
    <div className="p-4 md:p-8 bg-[var(--bg)] min-h-screen circuit-pattern">
      <div className={`${isFullWidth ? 'w-full' : 'max-w-4xl'} mx-auto`}>
        <h1 className="text-xl md:text-2xl font-bold font-sans tracking-tight mb-8 text-[var(--ink)] uppercase">SME Operation Queue</h1>
        {myTasks.length === 0 ? (
          <div className="bento-card p-12 text-center bg-[var(--card-bg)]">
            <h3 className="text-lg font-medium text-[var(--ink)]">Pipeline Empty</h3>
            <p className="text-[var(--muted)] mt-2 font-mono text-xs uppercase tracking-widest">No active requirements or risk vectors assigned to your node.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myTasks.map((task, idx) => (
              <motion.div 
                key={task.id + idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bento-card p-6 bg-[var(--card-bg)] shadow-lg flex flex-col gap-4 border border-[var(--line)] hover:border-[var(--accent)]"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 items-center">
                    <span className="font-mono text-[9px] font-bold uppercase bg-[var(--nav-bg)] text-[var(--muted)] px-2 py-1 rounded-md border border-[var(--line)]">
                      {task.submissionTitle}
                    </span>
                    <span className="font-mono text-[9px] uppercase font-bold px-2 py-1 rounded-md border" style={{
                      backgroundColor: task.itemType === 'requirement' ? 'rgba(34, 211, 238, 0.1)' : task.itemType === 'risk' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      borderColor: task.itemType === 'requirement' ? 'var(--accent)' : task.itemType === 'risk' ? '#ef4444' : '#f59e0b',
                      color: task.itemType === 'requirement' ? 'var(--accent)' : task.itemType === 'risk' ? '#ef4444' : '#f59e0b'
                    }}>
                      {task.itemType}
                    </span>
                  </div>
                  {task.itemType === 'requirement' && <CheckCircle2 size={16} className="text-[var(--accent)]" />}
                  {task.itemType === 'risk' && <AlertTriangle size={16} className="text-red-400" />}
                  {task.itemType === 'assumption' && <HelpCircle size={16} className="text-amber-400" />}
                </div>

                <div className="font-medium text-[var(--ink)] text-sm md:text-base leading-relaxed">
                  {task.text || task.title || task.description}
                </div>

                {/* SME Action Area */}
                <div className="mt-4 pt-4 border-t border-[var(--line)] flex justify-end">
                  <button className="bg-[var(--accent)] text-[var(--bg)] px-5 py-2 rounded-full shadow-lg text-[10px] font-black uppercase font-mono hover:scale-105 active:scale-95 transition-all btn-energize">
                    Access Context
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
