const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes('GoogleChatSimulator')) {
  // Import
  code = code.replace(
    /import \{ CoPilotChat \} from '\.\/components\/CoPilotChat';/,
    "import { CoPilotChat } from './components/CoPilotChat';\nimport { GoogleChatSimulator } from './components/GoogleChatSimulator';"
  );
  
  // State
  code = code.replace(
    /const \[showCoPilot, setShowCoPilot\] = useState\(false\);/,
    "const [showCoPilot, setShowCoPilot] = useState(false);\n  const [showGchatSimulator, setShowGchatSimulator] = useState(false);"
  );
  
  // Button in integrations pane
  code = code.replace(
    /<span className="text-xs font-mono font-bold flex items-center gap-2">\s*<svg[^>]*>[\s\S]*?<\/svg>\s*Google Chat Notify\s*<\/span>/,
    `<div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.03 2 11c0 2.8 1.45 5.3 3.73 7C5 19.83 3.5 21 3.5 21s1.39-.12 3.86-1.07c1.47.46 3.03.71 4.64.71 5.52 0 10-4.03 10-9S17.52 2 12 2z" fill="#00832d"/></svg>
                                        Google Chat Notify
                                    </span>
                                    <button onClick={() => setShowGchatSimulator(true)} className="px-2 py-0.5 ml-2 text-[9px] bg-green-700 text-white font-bold rounded hover:bg-green-800">SIMULATOR</button>
                                    </div>`
  );

  // Component rendering
  code = code.replace(
    /\{\/\* Co-Pilot Chat \*\/\}/,
    `{showGchatSimulator && <GoogleChatSimulator onClose={() => setShowGchatSimulator(false)} />}\n\n      {/* Co-Pilot Chat */}`
  );
}

fs.writeFileSync('src/App.tsx', code);
