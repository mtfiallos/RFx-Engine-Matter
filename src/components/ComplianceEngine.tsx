import React, { useState } from 'react';
import { ShieldCheck, PlayCircle, Loader2, AlertTriangle, CheckCircle2, ChevronRight, FileText, Scale, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateComplianceScan, generateSecurityAddendum } from '../services/geminiService';

export function ComplianceEngine({ submission }: { submission: any }) {
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [addendums, setAddendums] = useState<Record<string, string>>({});
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

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
    <div className="bg-[var(--bg)] min-h-screen text-[var(--ink)] p-8">
      <div className={`${submission.isFullWidth ? 'w-full' : 'max-w-7xl'} mx-auto space-y-8`}>
        
        <div className="flex items-center justify-between border-b border-[var(--line)] pb-8">
          <div>
            <h3 className="text-3xl font-bold font-sans tracking-tight text-[var(--ink)] flex items-center gap-3 uppercase tracking-tighter">
               <ShieldCheck className="text-[var(--accent)]" size={32} /> Compliance Rules Engine
            </h3>
            <p className="text-[var(--muted)] mt-2 font-mono text-sm max-w-2xl">
              Cross-references extracted requirements against standard frameworks (SOC2, ISO 27001, HIPAA) 
              to auto-verify compliance or generate formal security addendums.
            </p>
          </div>
          
          <button 
            onClick={handleScan}
            disabled={isScanning || results !== null || reqs.length === 0}
            className="bg-[var(--accent)] text-[var(--bg)] px-8 py-4 rounded-xl font-mono font-bold uppercase shadow-lg shadow-[var(--accent)]/10 hover:opacity-90 transition-all flex items-center gap-3 disabled:opacity-50 disabled:grayscale transition-all"
          >
            {isScanning ? <Loader2 size={20} className="animate-spin" /> : <PlayCircle size={20} />}
            {isScanning ? 'Verifying Integrity...' : (results ? 'Scan Validated' : 'Initiate Compliance Scan')}
          </button>
        </div>

        {reqs.length === 0 && !results && (
           <div className="p-20 text-center text-[var(--muted)] border-2 border-dashed border-[var(--line)] rounded-[32px] bg-[var(--card-bg)] shadow-inner">
              <Scale size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-mono text-sm uppercase tracking-widest">Extract requirements first to run a compliance scan.</p>
           </div>
        )}

        {results && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bento-card border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)] flex flex-col items-center justify-center p-8">
                    <CheckCircle2 className="text-green-500 mb-3" size={24} />
                    <span className="text-5xl font-black text-green-500 font-sans tracking-tighter tabular-nums">{results.summary.passed}</span>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--muted)] mt-2">Validated Control</span>
                 </div>
                 <div className="bento-card border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)] flex flex-col items-center justify-center p-8">
                    <AlertTriangle className="text-red-500 mb-3" size={24} />
                    <span className="text-5xl font-black text-red-500 font-sans tracking-tighter tabular-nums">{results.summary.failed}</span>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--muted)] mt-2">Compliance Gaps</span>
                 </div>
                 <div className="bento-card border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)] flex flex-col items-center justify-center p-8">
                    <ShieldCheck className="text-amber-500 mb-3" size={24} />
                    <span className="text-5xl font-black text-amber-500 font-sans tracking-tighter tabular-nums">{results.summary.manual}</span>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[var(--muted)] mt-2">Manual Review Req.</span>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12 bento-card !p-0 overflow-hidden border border-[var(--line)] shadow-xl">
                   <table className="w-full text-left">
                      <thead className="bg-[var(--line)] text-[var(--muted)] text-[10px] uppercase font-bold tracking-widest border-b border-[var(--line)]">
                         <tr>
                           <th className="p-6">Status</th>
                           <th className="p-6">Framework Control</th>
                           <th className="p-6">Requirement vs Resolution</th>
                           <th className="p-6 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)] font-mono">
                         {results.items.map((item: any, i: number) => (
                            <tr 
                              key={i} 
                              className={`hover:bg-white/5 transition-colors cursor-pointer group ${selectedItem?.id === item.id ? 'bg-white/5' : ''}`}
                              onClick={() => setSelectedItem(item)}
                            >
                               <td className="p-6">
                                  {item.status === 'pass' && <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center"><CheckCircle2 size={16} /></div>}
                                  {item.status === 'fail' && <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center"><AlertTriangle size={16} /></div>}
                                  {item.status === 'manual' && <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center"><ShieldCheck size={16} /></div>}
                               </td>
                               <td className="p-6">
                                  <span className="text-xs font-bold text-[var(--accent)] bg-[var(--accent)]/5 px-3 py-1 rounded-full">{item.framework}</span>
                               </td>
                               <td className="p-6 group-hover:pr-12 transition-all">
                                  <div className="max-w-3xl">
                                    <p className="text-sm text-[var(--ink)] font-bold mb-1 line-clamp-1">{item.requirement}</p>
                                    <p className="text-[11px] text-[var(--muted)] line-clamp-1">{item.note}</p>
                                    
                                    {addendums[item.id] && (
                                       <div className="mt-4 p-4 bg-white/5 border border-[var(--line)] rounded-xl relative">
                                          <div className="absolute top-2 right-4 text-[9px] uppercase font-bold text-[var(--accent)] opacity-50">Draft Security Addendum</div>
                                          <p className="text-[11px] whitespace-pre-wrap font-serif text-[var(--ink)] opacity-80 leading-relaxed italic">
                                            "{addendums[item.id].slice(0, 150)}..."
                                          </p>
                                       </div>
                                    )}
                                  </div>
                               </td>
                               <td className="p-6 text-right">
                                  <ChevronRight className={`inline-block transition-transform ${selectedItem?.id === item.id ? 'rotate-90' : ''}`} />
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
           </motion.div>
        )}

        {/* Focus Detail View Panel (Side-by-side mockup) */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-[var(--card-bg)] border-l border-[var(--line)] shadow-2xl z-[60] flex flex-col"
            >
              <div className="p-6 border-b border-[var(--line)] flex items-center justify-between bg-[var(--bg)]/50">
                <div className="flex items-center gap-3">
                  <Scale className="text-[var(--accent)]" size={20} />
                  <h4 className="font-sans font-bold uppercase text-[var(--ink)] tracking-tight">Compliance Deep-Scan</h4>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-white/10 rounded-full text-[var(--muted)]">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <section>
                  <h5 className="font-mono text-[10px] font-bold uppercase text-[var(--accent)] mb-3">Extracted Requirement</h5>
                  <div className="p-6 bg-[var(--bg)] border border-[var(--line)] rounded-2xl">
                    <p className="text-lg font-sans font-medium text-[var(--ink)]">{selectedItem.requirement}</p>
                  </div>
                </section>

                <section>
                  <h5 className="font-mono text-[10px] font-bold uppercase text-[var(--accent)] mb-3">Framework Comparison ({selectedItem.framework})</h5>
                  <div className="p-6 bg-[var(--muted-bg)] border border-[var(--line)] rounded-2xl space-y-4">
                    <div className="flex items-start gap-3">
                      {selectedItem.status === 'pass' ? <CheckCircle2 className="text-green-500 shrink-0" size={18} /> : <AlertTriangle className="text-red-500 shrink-0" size={18} />}
                      <div>
                        <p className="text-sm font-bold text-[var(--ink)]">AI Logic Consistency Check</p>
                        <p className="text-xs text-[var(--muted)] mt-1">{selectedItem.note}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h5 className="font-mono text-[10px] font-bold uppercase text-[var(--accent)] mb-3">Resolution Action</h5>
                  {addendums[selectedItem.id] ? (
                    <div className="space-y-4">
                      <div className="p-6 bg-[var(--bg)] border border-[var(--accent)]/30 rounded-2xl shadow-[0_0_30px_rgba(100,255,218,0.05)]">
                        <h6 className="font-mono text-[11px] font-bold uppercase mb-4 flex items-center gap-2">
                           <FileText size={14} /> Formal Draft Addendum
                        </h6>
                        <div className="font-serif text-sm text-[var(--ink)] opacity-90 leading-relaxed whitespace-pre-wrap bg-[var(--muted-bg)] p-4 rounded-lg">
                          {addendums[selectedItem.id]}
                        </div>
                      </div>
                      <button 
                        className="w-full py-3 bg-[var(--line)] text-[var(--ink)] rounded-xl font-mono font-bold uppercase text-xs hover:bg-[var(--muted-bg)] transition-all border border-white/5"
                        onClick={() => {
                          const blob = new Blob([addendums[selectedItem.id]], {type: 'text/plain'});
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `Security_Addendum_${selectedItem.framework.replace(/\s/g, '_')}.txt`;
                          a.click();
                        }}
                      >
                        Export as Text
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-[var(--muted)] font-mono italic">No addendum drafted for this gap yet.</p>
                      <button 
                        onClick={() => handleGenerateAddendum(selectedItem)}
                        disabled={draftingId === selectedItem.id}
                        className="w-full py-6 border-2 border-dashed border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] rounded-2xl transition-all flex flex-col items-center justify-center gap-3 group"
                      >
                        {draftingId === selectedItem.id ? (
                           <Loader2 size={24} className="animate-spin" />
                        ) : (
                           <PlayCircle size={24} className="group-hover:scale-110 transition-transform" />
                        )}
                        <span className="font-mono text-[11px] font-bold uppercase tracking-widest">{draftingId === selectedItem.id ? 'Drafting Technical Language...' : 'Generate AI Security Addendum'}</span>
                      </button>
                    </div>
                  )}
                </section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
