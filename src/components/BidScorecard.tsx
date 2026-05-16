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
    <div className="bg-white border text-sm p-6 overflow-y-auto w-full">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        
        <div className="flex items-start justify-between">
          <div>
             <h3 className="text-xl font-bold font-sans tracking-tight text-slate-900">Bid / No-Bid Decision Scorecard</h3>
             <p className="text-slate-500 mt-1">Automated viability analysis based on historically successful parameters, tech requirements, and margin analysis.</p>
          </div>
          
          <div className="flex gap-4 items-center">
            {currentScore !== null ? (
               <div className="flex flex-col items-end">
                 <span className="text-xs uppercase font-bold text-slate-400">Recommendation</span>
                 <span className={`text-4xl font-black ${currentScore >= 75 ? 'text-green-600' : currentScore >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                   {currentScore >= 75 ? 'GO' : currentScore >= 50 ? 'BORDERLINE' : 'NO-GO'}
                 </span>
               </div>
            ) : (
                <button 
                  onClick={handleGenerateScore}
                  disabled={isScoring}
                  className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isScoring ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
                  {isScoring ? 'Analyzing RFx...' : 'Run Analysis Pipeline'}
                </button>
            )}
          </div>
        </div>

        {scoreData !== null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Primary Metrics */}
            <div className="border border-neutral-200 rounded-xl p-5 bg-slate-50 relative overflow-hidden">
               <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 rounded-full opacity-50"></div>
               <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Target size={18} className="text-blue-500" /> Overall Win Probability</h4>
               <div className="flex items-end gap-3 mb-2">
                 <span className="text-5xl font-black tracking-tighter text-slate-900">{scoreData.score}%</span>
               </div>
               <div className="w-full bg-slate-200 rounded-full h-2 mt-4">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${scoreData.score}%` }}></div>
               </div>
            </div>

            {/* Sub-scores */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                 <div className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-indigo-500" />
                    <span className="font-medium text-slate-700">Capabilities Match</span>
                 </div>
                 <span className="font-bold text-slate-900">{scoreData.capabilitiesMatch}%</span>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                 <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-500" />
                    <span className="font-medium text-slate-700">Margin Viability</span>
                 </div>
                 <span className="font-bold text-slate-900">{scoreData.marginViability}%</span>
              </div>
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                 <div className="flex items-center gap-2">
                    <ShieldAlert size={16} className="text-amber-500" />
                    <span className="font-medium text-slate-700">Risk Profile</span>
                 </div>
                 <span className="font-bold text-slate-900">{scoreData.riskProfile}</span>
              </div>
            </div>

            {/* Historical Comparison */}
            {scoreData.historyComparison && scoreData.historyComparison.length > 0 && (
                <div className="md:col-span-2 border border-neutral-200 rounded-xl p-6 bg-slate-50 shadow-sm mt-4">
                   <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">Historical Adjustments & Comparisons</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {scoreData.historyComparison.map((comp: any, i: number) => (
                         <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
                             <div className="flex justify-between items-center mb-2">
                                <span className="text-xs uppercase font-bold text-slate-500">{comp.metric}</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${comp.trend === 'up' ? 'bg-green-100 text-green-700' : comp.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-600'}`}>{comp.value}</span>
                             </div>
                             <p className="text-xs text-slate-600 leading-snug">{comp.explanation}</p>
                         </div>
                      ))}
                   </div>
                </div>
            )}

            {/* Generated Insights */}
            <div className="md:col-span-2 border border-neutral-200 rounded-xl p-6 bg-white shadow-sm">
               <h4 className="font-bold text-slate-900 mb-4">Gemini Analysis Summary</h4>
               <ul className="space-y-3">
                 {scoreData.insights.map((insight: any, i: number) => (
                   <li key={i} className="flex gap-3 text-slate-600">
                      <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${insight.severity === 'positive' ? 'bg-green-500' : insight.severity === 'negative' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                      <p><strong>{insight.type}:</strong> {insight.text}</p>
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
