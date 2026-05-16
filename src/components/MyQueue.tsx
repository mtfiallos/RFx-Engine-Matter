import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RfxSubmission, Requirement, Risk, Assumption } from '../services/rfxService';
import { CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

export function MyQueue({ submissions, userEmail }: { submissions: RfxSubmission[], userEmail?: string | null }) {
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
    return <div className="p-8 text-center text-neutral-500">Please sign in to view your queue.</div>;
  }

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold font-sans tracking-tight mb-6">My SME Action Queue</h1>
        {myTasks.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-neutral-200">
            <h3 className="text-lg font-medium text-slate-800">You're all caught up!</h3>
            <p className="text-slate-500 mt-2">No requirements or risks assigned to you at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myTasks.map((task, idx) => (
              <motion.div 
                key={task.id + idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-2 items-center">
                    <span className="font-mono text-[10px] uppercase bg-slate-100 text-slate-600 px-2 py-1 rounded">
                      {task.submissionTitle}
                    </span>
                    <span className="font-mono text-[10px] uppercase font-bold px-2 py-1 rounded" style={{
                      backgroundColor: task.itemType === 'requirement' ? '#eef2ff' : task.itemType === 'risk' ? '#fef2f2' : '#fffbeb',
                      color: task.itemType === 'requirement' ? '#4f46e5' : task.itemType === 'risk' ? '#dc2626' : '#d97706'
                    }}>
                      {task.itemType}
                    </span>
                  </div>
                  {task.itemType === 'requirement' && <CheckCircle2 size={16} className="text-neutral-400" />}
                  {task.itemType === 'risk' && <AlertTriangle size={16} className="text-red-400" />}
                  {task.itemType === 'assumption' && <HelpCircle size={16} className="text-amber-400" />}
                </div>

                <div className="font-medium text-slate-900">
                  {task.text || task.title || task.description}
                </div>

                {/* Add a placeholder action logic or link to submission */}
                <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-end">
                  <button className="bg-slate-900 text-white px-4 py-2 rounded-md shadow-sm text-xs font-bold uppercase font-mono hover:bg-slate-800 transition-colors">
                    Go to Submission Context
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
