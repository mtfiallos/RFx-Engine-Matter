const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// replace extractRequirementsFromFile import
content = content.replace("extractRequirementsFromFile,", "extractEntityFromFile,\n");

// config replacements
content = content.replace(
  "const [maintenanceMode, setMaintenanceMode] = useState(() => localStorage.getItem('maintenanceMode') === 'true');",
  "const [maintenanceMode, setMaintenanceMode] = useState(() => localStorage.getItem('maintenanceMode') === 'true');\n  const [aiPacingMs, setAiPacingMs] = useState(() => parseInt(localStorage.getItem('aiPacingMs') || '5000', 10));"
);
content = content.replace(
  "const [tempMaintenance, setTempMaintenance] = useState(maintenanceMode);",
  "const [tempMaintenance, setTempMaintenance] = useState(maintenanceMode);\n  const [tempAiPacingMs, setTempAiPacingMs] = useState(aiPacingMs.toString());"
);

const configUI = `
                          <div>
                            <label className="block text-[10px] font-bold uppercase opacity-60 mb-1">AI Pacing & Rate Limit Delay (Ms)</label>
                            <input type="number" value={tempAiPacingMs} onChange={e => setTempAiPacingMs(e.target.value)} className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none focus:ring-1 ring-black" />
                            <p className="text-[10px] opacity-60 mt-2">Adjust delay between AI requests to prevent quota exhaustion.</p>
                          </div>
`;
content = content.replace(
  "                        <div className=\"space-y-6 bg-white rounded-xl border border-neutral-200 rounded-lg p-6 shadow-sm rounded-xl\">\n                          <div>",
  "                        <div className=\"space-y-6 bg-white rounded-xl border border-neutral-200 rounded-lg p-6 shadow-sm rounded-xl\">\n" + configUI + "                          <div>"
);
content = content.replace(
  "setSystemAppDesc(tempAppDesc);",
  "setSystemAppDesc(tempAppDesc);\n                            setAiPacingMs(parseInt(tempAiPacingMs, 10));"
);
content = content.replace(
  "localStorage.setItem('systemAppDesc', tempAppDesc);",
  "localStorage.setItem('systemAppDesc', tempAppDesc);\n                            localStorage.setItem('aiPacingMs', tempAiPacingMs);"
);

// upload logic - dont extract requirements automatically
content = content.replace(
  "const extraction = await extractRequirementsFromFile(file.name, content || 'Binary content detected.');",
  "const extraction = undefined; // Extracted on demand"
);
content = content.replace( // there might be a second one
  "const extraction = await extractRequirementsFromFile(file.name, content || 'Binary content detected.');",
  "const extraction = undefined;"
);


// State additions
content = content.replace(
  "const [activeRegisterTab, setActiveRegisterTab] = useState<'assumptions' | 'risks'>('assumptions');",
  "const [activeRegisterTab, setActiveRegisterTab] = useState<'requirements' | 'assumptions' | 'risks'>('requirements');\n  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);\n  const stopTaskRefs = React.useRef<{[id: string]: boolean}>({});\n  const [selectedGems, setSelectedGems] = useState<string[]>([]);"
);

// We need a useEffect to populate selectedFileIds when files change, but only if they weren't previously populated or if a new file is added.
// Wait, "when the screen loads it defaults to all files being selected"
// So:
const selectAllEffect = `
  React.useEffect(() => {
    if (data && data.files) {
      setSelectedFileIds(prev => {
        const newIds = data.files!.map(f => f.id);
        const addedIds = newIds.filter(id => !prev.includes(id));
        if (addedIds.length > 0) return [...prev, ...addedIds];
        if (prev.length === 0 && newIds.length > 0) return newIds;
        return prev;
      });
    }
  }, [data?.files]);
`;

content = content.replace(
  "const [activeRegisterTab,",
  selectAllEffect + "\n  const [activeRegisterTab,"
);

fs.writeFileSync('src/App.tsx', content);
