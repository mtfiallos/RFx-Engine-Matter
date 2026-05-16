const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  /onClick=\{handleAiAnalysis\}\s+disabled=\{isAnalyzing\}\s+className="font-mono text-\[10px\] font-bold uppercase flex items-center gap-1\.5 px-4 py-2 rounded-md bg-slate-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-30 transition-colors shadow-\[4px_4px_0px_0px_rgba\(0,0,0,0\.2\)\]"\s+>\s+<Sparkles size=\{10\} className=\{isAnalyzing \? 'animate-pulse' : ''\} \/>\s+\{isAnalyzing \? 'ANALYZING\.\.\.' : 'AI SCAN PACKAGE'\}/,
  "onClick={() => handleAiAnalysis('assumptions')}\n                  disabled={isAnalyzing}\n                  className=\"font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-30 transition-colors shadow-[4px_4px_0px_0px_rgba(37,99,235,0.4)]\"\n                >\n                  <Sparkles size={10} className={isAnalyzing ? 'animate-pulse' : ''} />\n                  {isAnalyzing ? 'ANALYZING...' : 'AI SCAN PACKAGE'}"
);

content = content.replace(
  /onClick=\{handleAiAnalysis\}\s+disabled=\{isAnalyzing\}\s+className="font-mono text-\[10px\] font-bold uppercase flex items-center gap-1\.5 px-4 py-2 rounded-md bg-slate-900 text-white rounded-lg hover:bg-neutral-800 disabled:opacity-30 transition-colors shadow-\[4px_4px_0px_0px_rgba\(0,0,0,0\.2\)\]"\s+>\s+<Sparkles size=\{10\} className=\{isAnalyzing \? 'animate-pulse' : ''\} \/>\s+\{isAnalyzing \? 'ANALYZING\.\.\.' : 'AI SCAN PACKAGE'\}/,
  "onClick={() => handleAiAnalysis('risks')}\n                  disabled={isAnalyzing}\n                  className=\"font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 px-4 py-2 rounded-md bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-30 transition-colors shadow-[4px_4px_0px_0px_rgba(220,38,38,0.4)]\"\n                >\n                  <Sparkles size={10} className={isAnalyzing ? 'animate-pulse' : ''} />\n                  {isAnalyzing ? 'ANALYZING...' : 'AI SCAN PACKAGE'}"
);

fs.writeFileSync('src/App.tsx', content);

