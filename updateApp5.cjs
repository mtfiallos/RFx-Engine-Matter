const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. "Ready to trigger NGP-002" string update
content = content.replace(
  "Documentation detected. Ready to trigger NGP-002 Orchestrator for requirement mapping and risk scoring.",
  "Documentation detected. Ready to trigger Orchestrator - select file(s) & flow(s) first."
);

// 2. Remove "SELECT ALL" from submissions
content = content.replace(
  "{selectedIds.length === submissions.length ? 'DESELECT ALL' : 'SELECT ALL'}",
  "" // Or we can remove the button completely, let's remove the whole button.
);
content = content.replace(
  /<button\s+onClick=\{[^}]+\}\s+className="[^"]+"\s*>\s*<div[^>]+>\s*\{selectedIds\.length === submissions\.length && <div[^>]+ \/>\}\s*<\/div>\s*<\/button>/g,
  ""
);

// Let's just do a simpler removal of the DESELECT ALL button in submissions.
// I will script it below to find the exact button.

// 3. Add states for fullWidth, darkMode, viewingGem
content = content.replace(
  "const [maintenanceMode, setMaintenanceMode] = useState(() => localStorage.getItem('maintenanceMode') === 'true');",
  "const [maintenanceMode, setMaintenanceMode] = useState(() => localStorage.getItem('maintenanceMode') === 'true');\n  const [isFullWidth, setIsFullWidth] = useState(() => localStorage.getItem('isFullWidth') === 'true');\n  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('isDarkMode') === 'true');\n  const [viewingGemContent, setViewingGemContent] = useState<string | null>(null);\n"
);

// Apply dark mode immediately on mount/change
const dmEffect = `
  React.useEffect(() => {
    if (isDarkMode) {
       document.documentElement.classList.add('dark');
    } else {
       document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('isDarkMode', String(isDarkMode));
  }, [isDarkMode]);

  React.useEffect(() => {
    localStorage.setItem('isFullWidth', String(isFullWidth));
  }, [isFullWidth]);
`;

content = content.replace(
  "const [activeTab, setActiveTab]",
  dmEffect + "\n  const [activeTab, setActiveTab]"
);

// Update max-w classes based on isFullWidth
// max-w-7xl -> \${isFullWidth ? 'w-full px-4' : 'max-w-7xl'}
// max-w-5xl -> \${isFullWidth ? 'w-full px-4' : 'max-w-5xl mx-auto'}

// 4. "for each one of the workflow steps there should be a small pencil icon in the upper right corner"
content = content.replace(
  "                  <div className=\"min-w-0 w-full\">\n                    <p className=\"font-mono text-[8px] font-bold\">GEM {gem.id}</p>",
  "                  <div className=\"min-w-0 w-full flex justify-between\">\n                    <p className=\"font-mono text-[8px] font-bold\">GEM {gem.id}</p>\n                    <button onClick={(e) => { e.stopPropagation(); setViewingGemContent(gem.logic); }} className=\"text-black opacity-50 hover:opacity-100\"><Edit2 size={10} /></button>"
);
// Import Edit2, Maximize, Moon? 
// We will add imports manually.

// 5. Select All for files
const selectAllFilesBtn = `
              <Tooltip content="Select or Deselect All Files">
                <button 
                  onClick={() => {
                    if (data?.files && selectedFileIds.length === data.files.length) {
                       setSelectedFileIds([]);
                    } else {
                       setSelectedFileIds((data?.files || []).map(f => f.id));
                    }
                  }}
                  className="font-mono text-[10px] font-bold uppercase px-4 py-2 rounded-md bg-neutral-200 text-black shadow-sm hover:bg-neutral-300 transition-colors mr-2"
                >
                  {data?.files && selectedFileIds.length > 0 && selectedFileIds.length === data.files.length ? 'DESELECT ALL' : 'SELECT ALL'}
                </button>
              </Tooltip>
`;
content = content.replace(
  "<Tooltip content=\"Upload documentation (or drag & drop files here)\">",
  selectAllFilesBtn + "\n              <Tooltip content=\"Upload documentation (or drag & drop files here)\">"
);

// 6. Fix "when no requirements the scan files for requirements green button below middle doesnt show."
content = content.replace(
  "                  <td colSpan={6} className=\"p-8 text-center opacity-70 italic\">No requirements registered.</td>",
  "                  <td colSpan={6} className=\"p-8 text-center\">\n                    <span className=\"opacity-70 italic block mb-4\">No requirements registered.</span>\n                    {data.files && data.files.length > 0 && (\n                      <button \n                        onClick={() => handleAiAnalysis('requirements')}\n                        disabled={isAnalyzing}\n                        className=\"bg-green-600 text-white px-6 py-2 text-xs font-medium disabled:opacity-30 inline-flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-[4px_4px_0px_0px_rgba(22,163,74,0.4)] rounded-lg mx-auto\"\n                      >\n                        <Sparkles size={14} className={isAnalyzing ? 'animate-pulse' : ''} />\n                        {isAnalyzing ? 'ANALYZING...' : 'AI SCAN PACKAGE'}\n                      </button>\n                    )}\n                  </td>"
);

// We need to add the Logic Viewer modal
const viewingModal = `
      {viewingGemContent && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-8 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-full flex flex-col no-invert">
            <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center bg-slate-900 text-white rounded-t-xl">
              <h3 className="font-bold text-lg">AI Logic Viewer</h3>
              <button onClick={() => setViewingGemContent(null)} className="hover:opacity-70"><X size={20}/></button>
            </div>
            <div className="p-6 overflow-y-auto bg-neutral-50 text-sm font-mono text-neutral-800 whitespace-pre-wrap">
              {viewingGemContent}
            </div>
          </div>
        </div>
      )}
`;
// Insert before final return div ends
const finalDivIdx = content.lastIndexOf("</div>");
content = content.slice(0, finalDivIdx) + viewingModal + content.slice(finalDivIdx);

fs.writeFileSync('src/App.tsx', content);
