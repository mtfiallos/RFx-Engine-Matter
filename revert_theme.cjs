const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// reverse the activeTab logic first so we don't accidentally match something else
content = content.replace(/\? 'bg-cyan-500\/20 text-cyan-700 dark:text-cyan-300 border-r-4 border-cyan-500' : (.*?)'/g, "? 'bg-black text-white' : $1'");

// General text and borders
content = content.replace(/border-slate-300 dark:border-slate-700\/50/g, 'border-black');
content = content.replace(/text-slate-900 dark:text-slate-100/g, 'text-black');
// Only replace the full glass background string since `text-slate-900` was also replaced separately
content = content.replace(/bg-white\/60 dark:bg-slate-900\/60 backdrop-blur-md/g, 'bg-white');

// Exceptions that got broken
content = content.replace(/bg-slate-50\/60 dark:bg-slate-800\/60 backdrop-blur-md/g, 'bg-neutral-50');

// Buttons / Accents
content = content.replace(/bg-slate-900 dark:bg-cyan-900\/50 text-white dark:text-cyan-100 border border-transparent dark:border-cyan-500\/30 hover:bg-cyan-600 dark:hover:bg-cyan-800 transition-all shadow-md/g, 'bg-black text-white');

// Glass morphism specific
content = content.replace(/shadow-lg dark:shadow-\[0_0_15px_rgba\(6,182,212,0\.15\)\]/g, 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]');

// Hover actions cyan
content = content.replace(/hover:bg-cyan-500\/10 dark:hover:bg-cyan-500\/20 dark:text-slate-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors/g, 'hover:bg-black/5');
content = content.replace(/hover:bg-cyan-500\/20 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors/g, 'hover:bg-black hover:text-white');
content = content.replace(/hover:bg-cyan-600 dark:hover:bg-cyan-400 hover:text-white dark:hover:text-slate-900 hover:shadow-\[0_0_15px_rgba\(6,182,212,0\.5\)\] transition-colors/g, 'hover:bg-neutral-800 transition-colors');
content = content.replace(/hover:bg-cyan-600 dark:hover:bg-cyan-400 hover:text-white dark:hover:text-slate-900 transition-all hover:shadow-\[0_0_15px_rgba\(6,182,212,0\.5\)\] transition-colors/g, 'hover:bg-neutral-800 transition-colors');

// Any stray ones from the manual edit
content = content.replace(/hover:bg-cyan-600 dark:hover:bg-cyan-400 hover:text-white dark:hover:text-slate-900 transition-all hover:shadow-\[0_0_15px_rgba\(6,182,212,0\.5\)\]/g, 'hover:bg-neutral-800');
content = content.replace(/hover:bg-cyan-600 dark:hover:bg-cyan-800 transition-all shadow-md shadow-\[4px_4px_0px_0px_rgba\(0,0,0,0\.2\)\]/g, 'hover:bg-neutral-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]');

// Base background for App
content = content.replace(/min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors bg-\[radial-gradient\(ellipse_at_top,_var\(--tw-gradient-stops\)\)\] from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-950/g, 'min-h-screen bg-slate-50');

// Re-write the Rename
content = content.replace(/RFx Engine/g, 'RFx TRUEUP ENGINE');
content = content.replace(/VERSION 9\.1\.0 \/\/ NGP-002 ENFORCED/g, 'VERSION 9.0.0 // NGP-002 ENFORCED');

fs.writeFileSync('src/App.tsx', content);
console.log("Reversed branding successfully.");
