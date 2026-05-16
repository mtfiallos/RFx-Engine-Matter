const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// General text and borders
content = content.replace(/border-black/g, 'border-slate-300 dark:border-slate-700/50');
content = content.replace(/text-black/g, 'text-slate-900 dark:text-slate-100');
content = content.replace(/bg-white([^/])/g, 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-md$1');

// Exceptions that got broken
content = content.replace(/bg-neutral-50/g, 'bg-slate-50/60 dark:bg-slate-800/60 backdrop-blur-md');

// Buttons / Accents
content = content.replace(/bg-black text-white/g, 'bg-slate-900 dark:bg-cyan-900/50 text-white dark:text-cyan-100 border border-transparent dark:border-cyan-500/30 hover:bg-cyan-600 dark:hover:bg-cyan-800 transition-all shadow-md');

// Glass morphism specific
content = content.replace(/shadow-\[.*?rgba\(0,0,0,1\).*?\]/g, 'shadow-lg dark:shadow-[0_0_15px_rgba(6,182,212,0.15)]');

// Hover actions cyan
content = content.replace(/hover:bg-black\/5/g, 'hover:bg-cyan-500/10 dark:hover:bg-cyan-500/20 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors');
content = content.replace(/hover:bg-black hover:text-white/g, 'hover:bg-cyan-500/20 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors');
content = content.replace(/hover:bg-neutral-800/g, 'hover:bg-cyan-600 dark:hover:bg-cyan-400 hover:text-white dark:hover:text-slate-900 transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]');

// Base background for App
content = content.replace(/min-h-screen bg-slate-50/g, 'min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950');

// Selected tab logic
// current: activeTab === 'status' ? 'bg-black text-white' : 'hover:bg-black/5'
content = content.replace(/\? 'bg-black text-white' : (.*?)'/g, "? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-r-4 border-cyan-500' : $1'");
content = content.replace(/\? 'bg-slate-900 dark:bg-cyan-900\/50 text-white dark:text-cyan-100 border border-transparent dark:border-cyan-500\/30 hover:bg-cyan-600 dark:hover:bg-cyan-800 transition-all shadow-md' : (.*?)'/g, "? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-r-4 border-cyan-500' : $1'");

// Re-write the Rename
content = content.replace(/RFx TRUEUP ENGINE/g, 'RFx Engine');
content = content.replace(/VERSION 9\.0\.0 \/\/ NGP-002 ENFORCED/g, 'VERSION 9.1.0 // NGP-002 ENFORCED');

fs.writeFileSync('src/App.tsx', content);
console.log("Replaced branding successfully.");
