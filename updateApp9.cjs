const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Tooltips partially transparent
// Change: bg-slate-900 to bg-slate-900/90 backdrop-blur-sm z-[9999]
content = content.replace(
  "bg-slate-900 text-white rounded-lg text-[10px] p-2 font-mono z-[100] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]",
  "bg-slate-900/90 backdrop-blur-sm text-white rounded-lg text-[10px] p-2 font-mono z-[9999] shadow-lg"
);

// 2. Share button logic
content = content.replace(
  "<button onClick={() => setShareModalOpen(true)} className=\"flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 transition-colors font-mono text-[10px] font-bold\">",
  "<button onClick={() => submissionId ? setSharingId(submissionId) : alert('Please select a submission to share first.')} className=\"flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 transition-colors font-mono text-[10px] font-bold\">"
);

fs.writeFileSync('src/App.tsx', content);
