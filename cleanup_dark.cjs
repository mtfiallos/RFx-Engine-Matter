const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/bg-red-500\/10 text-red-600 dark:text-red-400 border border-red-500\/30 p-4 rounded-md flex justify-between items-start shadow-\[0_0_15px_rgba\(239,68,68,0\.1\)\]/g, 'mb-4 bg-red-50 text-red-700 border-l-4 border-red-500 p-3 flex justify-between items-start');
content = content.replace(/hover:bg-slate-200 dark:hover:bg-slate-800/g, 'hover:bg-slate-200');
content = content.replace(/bg-white dark:bg-slate-900/g, 'bg-white');
content = content.replace(/shadow-\[0_0_25px_rgba\(6,182,212,0\.2\)\] rounded-xl/g, 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]');
content = content.replace(/text-slate-600 dark:text-slate-400/g, 'text-slate-600');
content = content.replace(/hover:bg-slate-100 dark:hover:bg-slate-800/g, 'hover:bg-slate-100');
content = content.replace(/bg-slate-100 dark:bg-slate-900\/50/g, 'bg-slate-100');
content = content.replace(/bg-cyan-500\/10 dark:bg-cyan-900\/30/g, 'bg-neutral-100');
content = content.replace(/border-cyan-500\/20/g, 'border-black/10');
content = content.replace(/text-slate-800 dark:text-cyan-100/g, 'text-black');
content = content.replace(/bg-slate-900 dark:bg-cyan-900\/50 text-white dark:text-cyan-100/g, 'bg-black text-white');
content = content.replace(/hover:bg-cyan-600 dark:hover:bg-cyan-800 transition-all/g, 'hover:bg-neutral-800 transition-colors');
content = content.replace(/shadow-md hover:shadow-\[0_0_15px_rgba\(6,182,212,0\.5\)\]/g, 'shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]');

fs.writeFileSync('src/App.tsx', content);
console.log('Cleaned up dark classes');
