const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Config spacing
const configUI = `
                          <div>
                            <label className="block text-[10px] font-bold uppercase opacity-60 mb-1">AI Pacing & Rate Limit Delay (Ms)</label>
                            <input type="number" value={tempAiPacingMs} onChange={e => setTempAiPacingMs(e.target.value)} className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none focus:ring-1 ring-black" />
                            <p className="text-[10px] opacity-60 mt-2">Adjust delay between AI requests to prevent quota exhaustion.</p>
                          </div>
`;

content = content.replace(
  "const [maintenanceMode, setMaintenanceMode] = useState(() => localStorage.getItem('maintenanceMode') === 'true');",
  "const [maintenanceMode, setMaintenanceMode] = useState(() => localStorage.getItem('maintenanceMode') === 'true');\n  const [aiPacingMs, setAiPacingMs] = useState(() => parseInt(localStorage.getItem('aiPacingMs') || '5000', 10));"
);
content = content.replace(
  "const [tempMaintenance, setTempMaintenance] = useState(maintenanceMode);",
  "const [tempMaintenance, setTempMaintenance] = useState(maintenanceMode);\n  const [tempAiPacingMs, setTempAiPacingMs] = useState(aiPacingMs.toString());"
);

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

// 2. Add Requirements tab and logic for AI Scan Package
content = content.replace(
  "const [activeRegisterTab, setActiveRegisterTab] = useState<'assumptions' | 'risks'>('assumptions');",
  "const [activeRegisterTab, setActiveRegisterTab] = useState<'requirements' | 'assumptions' | 'risks'>('requirements');\n  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);\n  const stopTaskRefs = React.useRef<{[id: string]: boolean}>({});\n  const [selectedGems, setSelectedGems] = useState<string[]>([]);"
);

const useEff = `
  React.useEffect(() => {
    if (data && data.files) {
      setSelectedFileIds(prev => {
        const newIds = data.files.map(f => f.id);
        if (prev.length === 0) return newIds;
        return prev;
      });
    }
  }, [data?.files]);
`;
content = content.replace(
  "const [chatMessages, setChatMessages]",
  useEff + "\n  const [chatMessages, setChatMessages]"
);

// We need to replace the logic of handleAiAnalysis
// With one handleAiAnalysis function that receives 'requirements'|'assumptions'|'risks'
const oldHandleAi = `  const handleAiAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzePackage(data.assumptions || [], data.risks || []);
      
      let updatedData = { ...data };
      if (result.assumptions) updatedData.assumptions = [...(data.assumptions || []), ...result.assumptions];
      if (result.risks) updatedData.risks = [...(data.risks || []), ...result.risks];
      
      onUpdate(updatedData);
    } catch (e) {
      console.error(e);
      alert('AI Analysis failed. See console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };`;

const newHandleAi = `  const handleAiAnalysis = async (type: 'requirements' | 'assumptions' | 'risks') => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const selected = data.files?.filter(f => selectedFileIds.includes(f.id)) || [];
      if (selected.length === 0) {
        alert("Please select at least one file first.");
        return;
      }

      let updatedData = { ...data };
      if (!updatedData.requirements) updatedData.requirements = [];
      if (!updatedData.assumptions) updatedData.assumptions = [];
      if (!updatedData.risks) updatedData.risks = [];

      for (let i = 0; i < selected.length; i++) {
        const file = selected[i];
        try {
           const results = await extractEntityFromFile(file.name, file.content || '', type);
           
           if (type === 'requirements') {
             updatedData.requirements.push(...results.map((r: any) => ({ ...r, id: \`REQ-\${Date.now()}-\${Math.random().toString(36).substring(2,7)}\`, source: file.name, status: 'pending' })));
           } else if (type === 'assumptions') {
             updatedData.assumptions.push(...results.map((r: any) => ({ id: \`ASM-\${Date.now()}-\${Math.random().toString(36).substring(2,7)}\`, description: typeof r === 'string' ? r : (r.text || r.description), source: file.name, status: 'open', impact: 'medium' })));
           } else if (type === 'risks') {
             updatedData.risks.push(...results.map((r: any) => ({ id: \`RSK-\${Date.now()}-\${Math.random().toString(36).substring(2,7)}\`, title: typeof r === 'string' ? r : (r.title || r.text || r.description), source: file.name, impact: 'medium', probability: 'medium', mitigation: 'Pending AI Analysis' })));
           }
           
           // Update file scansCompleted
           const fileIdx = updatedData.files.findIndex(f => f.id === file.id);
           if (fileIdx > -1) {
             const f = updatedData.files[fileIdx];
             if (!f.scansCompleted) f.scansCompleted = [];
             if (!f.scansCompleted.includes(type)) f.scansCompleted.push(type);
           }
           
           onUpdate({...updatedData});
        } catch(e) {
          console.error("Failed extracting", type, "from", file.name);
        }
        
        if (i < selected.length - 1) {
           await new Promise(res => setTimeout(res, aiPacingMs));
        }
      }
      
    } catch (e) {
      console.error(e);
      alert('AI Analysis failed. See console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  };`;

content = content.replace(oldHandleAi, newHandleAi);

fs.writeFileSync('src/App.tsx', content);
