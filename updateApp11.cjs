const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Tooltip fix
const tooltipOld = `function Tooltip({ children, content }: { children: React.ReactNode, content: string }) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-xs -translate-x-1/2 scale-95 opacity-0 transition-opacity duration-200 group-hover:scale-100 group-hover:opacity-100 bg-slate-900/90 backdrop-blur-sm text-white rounded-lg text-[10px] p-2 font-mono z-[9999] shadow-lg">`;

const tooltipNew = `function Tooltip({ children, content }: { children: React.ReactNode, content: string }) {
  return (
    <div className="group/tooltip relative inline-flex">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-xs -translate-x-1/2 scale-95 opacity-0 transition-opacity duration-200 group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 bg-slate-900/90 backdrop-blur-sm text-white rounded-lg text-[10px] p-2 font-mono z-[9999] shadow-lg">`;

content = content.replace(tooltipOld, tooltipNew);

// 2. Change "Support Documentation Package"
content = content.replace(
  '<h5 className="text-xs font-medium tracking-tight">Support Documentation Package</h5>',
  '<h5 className="text-xs font-medium tracking-tight">RFx Client Documents & Artifacts</h5>'
);

// 3. Change "UPLOAD FILE" -> "UPLOAD FILES"
content = content.replace(
  '+ UPLOAD FILE\n                </button>',
  '+ UPLOAD FILES\n                </button>'
);

// 4. Change "INITIALIZE GEM CHAIN EXCEPTION HANDLER (v1)"
content = content.replace(
  'Disabled={tasks.some(t => t.status === \'IN_PROGRESS\')}',
  'disabled={tasks.some(t => t.status === \'IN_PROGRESS\') || selectedFileIds.length === 0 || selectedGems.length === 0}'
);

content = content.replace(
  'INITIALIZE GEM CHAIN EXCEPTION HANDLER (v1)',
  'INITIALIZE SELECTED WORKFLOWS'
);

// We need to be careful with disabled replacement, let's just use regex
content = content.replace(
  /disabled=\{tasks\.some\(t => t\.status === 'IN_PROGRESS'\)\}/g,
  "disabled={tasks.some(t => t.status === 'IN_PROGRESS') || (typeof selectedFileIds !== 'undefined' && selectedFileIds.length === 0) || (typeof selectedGems !== 'undefined' && selectedGems.length === 0)}"
);


fs.writeFileSync('src/App.tsx', content);
