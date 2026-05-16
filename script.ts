import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/shadow-\[(4|8)px_(4|8)px_0px_0px_rgba\(0,0,0,1\)\]/g, 'shadow-sm rounded-xl');
content = content.replace(/border border-black(?!\/)/g, 'border border-neutral-200 rounded-lg');
content = content.replace(/border border-black\/([0-9]+)/g, 'border border-neutral-100 rounded-lg');
content = content.replace(/bg-black text-white/g, 'bg-slate-900 text-white rounded-lg');
content = content.replace(/bg-white border/g, 'bg-white rounded-xl border');
content = content.replace(/rounded-sm/g, 'rounded-md');

// Also update buttons with "uppercase font-bold" to be sleek
content = content.replace(/font-mono text-xs font-bold uppercase/g, 'text-xs font-medium');
content = content.replace(/font-mono text-\[10px\] uppercase font-bold/g, 'text-xs font-medium text-slate-500 tracking-wide uppercase');

// Update some uppercase mono to sans-serif
content = content.replace(/font-mono text-xl font-bold uppercase/g, 'text-2xl font-semibold tracking-tight text-slate-900');
content = content.replace(/font-mono uppercase/g, 'text-slate-500 uppercase tracking-wide');

// Write back
fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Done replacement');
