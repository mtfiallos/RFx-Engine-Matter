const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const wrongBlock1 = '            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 transition-colors">';
const wrongBlock = wrongBlock1 + '\n              <Moon size={14} className="opacity-70" />\n            </button>\n            <button onClick={() => setIsFullWidth(!isFullWidth)} className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 transition-colors">\n              <Maximize size={14} className="opacity-70" />\n            </button>\n            <button onClick={() => setShareModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 transition-colors font-mono text-[10px] font-bold">\n              <Share2 size={12} className="opacity-70" />\n              SHARE\n            </button>';

content = content.replace(wrongBlock, "");
content = content.replace("<div className=\"flex items-center gap-3\">\n\n", "<div className=\"flex items-center gap-4\">\n");

content = content.replace(
  "{user ? (\n            <div className=\"flex items-center gap-4\">",
  "<div className=\"flex items-center gap-4\">\n" + wrongBlock + "\n</div>\n          {user ? (\n            <div className=\"flex items-center gap-4\">"
);

fs.writeFileSync('src/App.tsx', content);
