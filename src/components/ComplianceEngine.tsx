import React, { useState } from 'react';
import { ShieldCheck, PlayCircle, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateComplianceScan, generateSecurityAddendum } from '../services/geminiService';

export function ComplianceEngine({ submission }: { submission: any }) {
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [addendums, setAddendums] = useState<Record<string, string>>({});

  const reqs = submission.data.requirements || [];

  const handleScan = async () => {
    setIsScanning(true);
    try {
        const scanResults = await generateComplianceScan(reqs);
        setResults(scanResults);
    } catch(error) {
        console.error("Failed to run compliance scan:", error);
        alert("Compliance scan failed: " + (error as Error).message);
    } finally {
        setIsScanning(false);
    }
  };

  const handleGenerateAddendum = async (item: any) => {
     setDraftingId(item.id);
     try {
        const text = await generateSecurityAddendum(item.requirement, item.framework, item.note);
        setAddendums(prev => ({ ...prev, [item.id]: text || 'Content generated empty.' }));
     } catch (e: any) {
        alert("Failed to draft addendum: " + e.message);
     } finally {
        setDraftingId(null);
     }
  };

  return (
    <div className="bg-white border text-sm p-6 overflow-y-auto w-full">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        
        <div className="flex items-start justify-between border-b border-black/10 pb-4">
          <div>
            <h3 className="text-xl font-bold font-sans tracking-tight text-slate-900 flex items-center gap-2">
               <ShieldCheck className="text-indigo-600" /> Compliance Rules Engine
            </h3>
            <p className="text-slate-500 mt-1">Cross-references extracted requirements against standard frameworks (SOC2, ISO 27001, HIPAA) to auto-verify compliance or generate addendums.</p>
          </div>
          
          <button 
            onClick={handleScan}
            disabled={isScanning || results !== null || reqs.length === 0}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isScanning ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
            {isScanning ? 'Cross-Referencing...' : (results ? 'Scan Complete' : 'Run Compliance Scan')}
          </button>
        </div>

        {reqs.length === 0 && !results && (
           <div className="p-8 text-center text-slate-500 border border-dashed border-slate-300 rounded-lg">
              Extract requirements first to run a compliance scan.
           </div>
        )}

        {results && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                 <div className="bg-green-50 text-green-800 p-4 rounded-lg flex flex-col items-center justify-center border border-green-200">
                    <span className="text-3xl font-black">{results.summary.passed}</span>
                    <span className="text-xs uppercase font-bold tracking-wider">Passed</span>
                 </div>
                 <div className="bg-red-50 text-red-800 p-4 rounded-lg flex flex-col items-center justify-center border border-red-200">
                    <span className="text-3xl font-black">{results.summary.failed}</span>
                    <span className="text-xs uppercase font-bold tracking-wider">Failed / Needs Addendum</span>
                 </div>
                 <div className="bg-amber-50 text-amber-800 p-4 rounded-lg flex flex-col items-center justify-center border border-amber-200">
                    <span className="text-3xl font-black">{results.summary.manual}</span>
                    <span className="text-xs uppercase font-bold tracking-wider">Manual Review</span>
                 </div>
              </div>

              <div className="overflow-hidden border border-slate-200 rounded-lg shadow-sm">
                 <table className="w-full text-left">
                    <thead className="bg-slate-100 text-slate-600 text-xs uppercase font-bold">
                       <tr>
                         <th className="p-3 border-b">Status</th>
                         <th className="p-3 border-b">Framework Control</th>
                         <th className="p-3 border-b">Extracted Requirement</th>
                         <th className="p-3 border-b">AI Match / Resolution</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                       {results.items.map((item: any, i: number) => (
                          <tr key={i} className="hover:bg-slate-50 transition-colors">
                             <td className="p-3">
                                {item.status === 'pass' && <CheckCircle2 className="text-green-500" size={18} />}
                                {item.status === 'fail' && <AlertTriangle className="text-red-500" size={18} />}
                                {item.status === 'manual' && <ShieldCheck className="text-amber-500" size={18} />}
                             </td>
                             <td className="p-3 font-mono text-xs">{item.framework}</td>
                             <td className="p-3 text-sm text-slate-800">{item.requirement}</td>
                             <td className="p-3 text-sm text-slate-600">
                                {item.note}
                                {addendums[item.id] ? (
                                   <div className="mt-3 p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                                      <div className="flex justify-between items-center mb-1">
                                         <strong className="text-[10px] uppercase text-neutral-500">Drafted Addendum</strong>
                                      </div>
                                      <p className="text-xs whitespace-pre-wrap font-serif text-slate-700">{addendums[item.id]}</p>
                                   </div>
                                ) : (
                                   item.status === 'fail' && (
                                     <button 
                                        onClick={() => handleGenerateAddendum(item)}
                                        disabled={draftingId === item.id}
                                        className="block mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                                     >
                                        {draftingId === item.id ? 'Drafting...' : '+ Generate Addendum'}
                                     </button>
                                   )
                                )}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </motion.div>
        )}

      </div>
    </div>
  );
}
