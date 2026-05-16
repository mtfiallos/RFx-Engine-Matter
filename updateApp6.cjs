const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. imports
content = content.replace("Settings,", "Settings, Edit2, Maximize, Moon, Share2,");

// 2. Share button and Toggles
const topBarControls = `
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 transition-colors">
              <Moon size={14} className="opacity-70" />
            </button>
            <button onClick={() => setIsFullWidth(!isFullWidth)} className="w-8 h-8 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 transition-colors">
              <Maximize size={14} className="opacity-70" />
            </button>
            <button onClick={() => setShareModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 transition-colors font-mono text-[10px] font-bold">
              <Share2 size={12} className="opacity-70" />
              SHARE
            </button>
`;
content = content.replace(
  "<div className=\"flex items-center gap-4\">",
  "<div className=\"flex items-center gap-3\">\n" + topBarControls
);

// 3. Remove "SELECT ALL" from submissions tab manually inside the code
content = content.replace(
  /<button\s+onClick=\{[^}]+\}\s+className="flex items-center gap-2 px-3 py-1\.5 rounded-lg border border-black\/10 hover:bg-black\/5 transition-colors font-mono text-\[10px\] font-bold"\s*>\s*<div[^>]+>\s*\{selectedIds\.length === submissions\.length && <div[^>]+ \/>\}\s*<\/div>\s*\{selectedIds\.length === submissions\.length \? 'DESELECT ALL' : 'SELECT ALL'\}\s*<\/button>/,
  ""
);

// 4. Update max-w classes
// Replace "max-w-7xl mx-auto" with \`\${isFullWidth ? 'w-full' : 'max-w-7xl'} mx-auto\`
// Replace "max-w-5xl mx-auto" with \`\${isFullWidth ? 'w-full' : 'max-w-5xl'} mx-auto\`
content = content.replace(/className="([^"]*)max-w-7xl mx-auto([^"]*)"/g, "className={`$1${isFullWidth ? 'w-full' : 'max-w-7xl'} mx-auto$2`}");
content = content.replace(/className="([^"]*)max-w-5xl mx-auto([^"]*)"/g, "className={`$1${isFullWidth ? 'w-full' : 'max-w-5xl'} mx-auto$2`}");
// Actually some might be inside template literals already. Let's do a safer replace where we just match the specific known strings.
content = content.replace(/className="p-8 max-w-5xl mx-auto"/g, "className={`p-8 mx-auto ${isFullWidth ? 'w-full px-12' : 'max-w-5xl'}`}");
content = content.replace(/className="p-6 md:p-10 max-w-7xl mx-auto w-full"/g, "className={`p-6 md:p-10 mx-auto w-full ${isFullWidth ? '' : 'max-w-7xl'}`}");
content = content.replace(/className="p-8 max-w-5xl mx-auto h-full flex flex-col"/g, "className={`p-8 mx-auto h-full flex flex-col ${isFullWidth ? 'w-full px-12' : 'max-w-5xl'}`}");

fs.writeFileSync('src/App.tsx', content);

