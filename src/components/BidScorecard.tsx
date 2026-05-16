import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, DollarSign, Target, PlayCircle, Loader2 } from 'lucide-react';
import { generateBidScore } from '../services/geminiService';

export function BidScorecard({ submission }: { submission: any }) {
  const [scoreData, setScoreData] = useState<any>(null);
  const [isScoring, setIsScoring] = useState(false);

  const handleGenerateScore = async () => {
    setIsScoring(true);
    try {
        const result = await generateBidScore(submission);
        setScoreData(result);
    } catch(error) {
        console.error("Failed to generate bid score:", error);
        alert("Evaluation failed: " + (error as Error).message);
    } finally {
        setIsScoring(false);
    }
  };

  const currentScore = scoreData ? scoreData.score : null;

  return (
    <div className="bg-[var(--bg)] text-sm p-4 md:p-8 overflow-y-auto w-full circuit-pattern min-h-screen">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 border-b border-[var(--line)] pb-8">
          <div>
             <h3 className="text-xl md:text-2xl font-bold font-sans tracking-tight text-[var(--ink)] uppercase">Decision Analytics Scorecard</h3>
             <p className="text-[var(--muted)] mt-2 font-mono text-xs max-w-xl">Automated RFx viability analysis utilizing NGP-002 Orchestrator historical benchmarks and margin projections.</p>
          </div>
          
          <div className="flex gap-4 items-center shrink-0">
            {currentScore !== null ? (
               <div className="flex flex-col items-end">
                 <span className="text-[10px] uppercase font-bold text-[var(--muted)] font-mono tracking-widest">Recommendation</span>
                 <span className={`text-3xl md:text-5xl font-black tracking-tighter ${currentScore >= 75 ? 'text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]' : currentScore >= 50 ? 'text-[var(--accent)] drop-shadow-[0_0_10px_var(--accent-glow)]' : 'text-red-500'}`}>
                   {currentScore >= 75 ? 'GO // GREEN' : currentScore >= 50 ? 'BORDERLINE // AMBER' : 'NO-GO // RED'}
                 </span>
               </div>
            ) : (
                <button 
                  onClick={handleGenerateScore}
                  disabled={isScoring}
                  className="bg-[var(--accent)] text-[var(--bg)] px-8 py-3 rounded-full font-bold shadow-[0_0_20px_var(--accent-glow)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 font-sans uppercase text-xs"
                >
                  {isScoring ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
                  {isScoring ? 'Processing Matrices...' : 'Execute Evaluation'}
                </button>
            )}
          </div>
        </div>

        {scoreData !== null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Primary Metrics */}
            <div className="bento-card relative overflow-hidden bg-[var(--card-bg)]">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--accent)] opacity-5 rounded-full"></div>
               <h4 className="font-bold text-[var(--ink)] mb-4 flex items-center gap-2 font-mono uppercase text-xs tracking-wider"><Target size={18} className="text-[var(--accent)]" /> Win Probability Index</h4>
               <div className="flex items-end gap-3 mb-2">
                 <span className="text-4xl md:text-6xl font-black tracking-tighter text-[var(--accent)] leading-none">{scoreData.score}%</span>
               </div>
               <div className="w-full bg-[#020617] rounded-full h-1.5 mt-4">
                  <div className="bg-[var(--accent)] h-1.5 rounded-full shadow-[0_0_10px_var(--accent)]" style={{ width: `${scoreData.score}%` }}></div>
               </div>
            </div>

            {/* Sub-scores */}
            <div className="bento-card flex flex-col justify-center space-y-5 bg-[var(--card-bg)]">
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                 <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-indigo-400" />
                    <span className="font-medium text-[var(--muted)] font-mono text-[10px] uppercase">Capabilities Match</span>
                 </div>
                 <span className="font-bold text-[var(--ink)] text-lg">{scoreData.capabilitiesMatch}%</span>
              </div>
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                 <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-400" />
                    <span className="font-medium text-[var(--muted)] font-mono text-[10px] uppercase">Margin Viability</span>
                 </div>
                 <span className="font-bold text-[var(--ink)] text-lg">{scoreData.marginViability}%</span>
              </div>
              <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
                 <div className="flex items-center gap-2">
                    <ShieldAlert size={16} className="text-red-400" />
                    <span className="font-medium text-[var(--muted)] font-mono text-[10px] uppercase">Risk Profile</span>
                 </div>
                 <span className="font-bold text-[var(--ink)] text-lg uppercase">{scoreData.riskProfile}</span>
              </div>
            </div>

            {/* Historical Comparison */}
            {scoreData.historyComparison && scoreData.historyComparison.length > 0 && (
                <div className="md:col-span-2 bento-card !p-6 bg-[var(--card-bg)]">
                   <h4 className="font-bold text-[var(--ink)] mb-6 flex items-center gap-2 font-mono uppercase text-xs tracking-wider">Historical Adjustments & Comparisons</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {scoreData.historyComparison.map((comp: any, i: number) => (
                         <div key={i} className="bg-[var(--bg)] p-4 rounded-xl border border-[var(--line)] hover:border-[var(--accent)]/50 transition-colors">
                             <div className="flex justify-between items-center mb-3">
                                <span className="text-[9px] uppercase font-bold text-[var(--muted)] font-mono">{comp.metric}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${comp.trend === 'up' ? 'bg-green-500/10 text-green-400' : comp.trend === 'down' ? 'bg-red-500/10 text-red-400' : 'bg-neutral-800 text-neutral-400'}`}>{comp.value}</span>
                             </div>
                             <p className="text-[11px] text-[var(--muted)] leading-relaxed font-sans">{comp.explanation}</p>
                         </div>
                      ))}
                   </div>
                </div>
            )}

            {/* Generated Insights */}
            <div className="md:col-span-2 bento-card bg-[var(--bg)] border-[var(--accent)]/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
               <h4 className="font-bold text-[var(--accent)] mb-4 font-mono uppercase text-xs tracking-widest">Neural Analysis Insights</h4>
               <ul className="space-y-4">
                 {scoreData.insights.map((insight: any, i: number) => (
                   <li key={i} className="flex gap-4 p-3 rounded-lg bg-[var(--card-bg)]/50 border border-[var(--line)] hover:bg-[var(--card-bg)] transition-all">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor] ${insight.severity === 'positive' ? 'text-green-500 bg-green-500' : insight.severity === 'negative' ? 'text-red-500 bg-red-500' : 'text-amber-500 bg-amber-500'}`}></div>
                      <p className="text-xs text-[var(--ink)] leading-relaxed"><strong className="uppercase font-mono tracking-tighter opacity-70">{insight.type}:</strong> {insight.text}</p>
                   </li>
                 ))}
               </ul>
            </div>
            
          </motion.div>
        )}
      </div>
    </div>
  );
}
