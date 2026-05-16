const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add system settings
content = content.replace(
  "  const [isNavOpen, setIsNavOpen] = useState(false);",
  "  const [isNavOpen, setIsNavOpen] = useState(false);\n  const [systemAppName, setSystemAppName] = useState(() => localStorage.getItem('systemAppName') || 'RFx TRUEUP ENGINE');\n  const [systemAppDesc, setSystemAppDesc] = useState(() => localStorage.getItem('systemAppDesc') || 'Next-Generation Procurement AI Platform');\n  const [maintenanceMode, setMaintenanceMode] = useState(() => localStorage.getItem('maintenanceMode') === 'true');\n  const [tempAppName, setTempAppName] = useState(systemAppName);\n  const [tempAppDesc, setTempAppDesc] = useState(systemAppDesc);\n  const [tempMaintenance, setTempMaintenance] = useState(maintenanceMode);"
);

// Update Header
content = content.replace(
  '<h1 className="font-mono text-lg font-bold tracking-tight uppercase">RFx TRUEUP ENGINE</h1>',
  '<h1 className="font-mono text-lg font-bold tracking-tight uppercase">{systemAppName}</h1>'
);

const formSource = [
  '                          <div>',
  '                            <label className="block text-[10px] font-bold uppercase opacity-60 mb-1">Application Name</label>',
  '                            <input type="text" className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none focus:ring-1 ring-black" defaultValue="RFx TRUEUP ENGINE" />',
  '                          </div>',
  '                          <div>',
  '                            <label className="block text-[10px] font-bold uppercase opacity-60 mb-1">Platform Description</label>',
  '                            <textarea className="w-full border border-neutral-200 rounded-lg p-2 bg-white h-24 outline-none focus:ring-1 ring-black" defaultValue="Next-Generation Procurement AI Platform" />',
  '                          </div>',
  '                          <div className="pt-4 border-t border-black/10">',
  '                            <label className="block text-[10px] font-bold uppercase opacity-60 mb-1">Maintenance Mode</label>',
  '                            <div className="flex items-center gap-2">',
  '                              <input type="checkbox" id="maint-mode" className="w-4 h-4 border-black" />',
  '                              <label htmlFor="maint-mode" className="text-xs">Enable maintenance mode (Platform restricted to Admins & Owners ONLY)</label>',
  '                            </div>',
  '                          </div>',
  '                          <button onClick={() => alert("Settings updated.")} className="bg-slate-900 text-white rounded-lg px-6 py-3 text-xs font-bold uppercase hover:bg-neutral-800 transition-colors w-full sm:w-auto text-center shadow-sm rounded-xl active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1">Save Changes</button>'
].join('\\n');

const formReplacement = [
  '                          <div>',
  '                            <label className="block text-[10px] font-bold uppercase opacity-60 mb-1">Application Name</label>',
  '                            <input type="text" value={tempAppName} onChange={e => setTempAppName(e.target.value)} className="w-full border border-neutral-200 rounded-lg p-2 bg-white outline-none focus:ring-1 ring-black" />',
  '                          </div>',
  '                          <div>',
  '                            <label className="block text-[10px] font-bold uppercase opacity-60 mb-1">Platform Description</label>',
  '                            <textarea value={tempAppDesc} onChange={e => setTempAppDesc(e.target.value)} className="w-full border border-neutral-200 rounded-lg p-2 bg-white h-24 outline-none focus:ring-1 ring-black" />',
  '                          </div>',
  '                          <div className="pt-4 border-t border-black/10">',
  '                            <label className="block text-[10px] font-bold uppercase opacity-60 mb-1">Maintenance Mode</label>',
  '                            <div className="flex items-center gap-2">',
  '                              <input type="checkbox" checked={tempMaintenance} onChange={e => setTempMaintenance(e.target.checked)} id="maint-mode" className="w-4 h-4 border-black" />',
  '                              <label htmlFor="maint-mode" className="text-xs">Enable maintenance mode (Platform restricted to Admins & Owners ONLY)</label>',
  '                            </div>',
  '                          </div>',
  '                          <button onClick={() => { setSystemAppName(tempAppName); localStorage.setItem(\'systemAppName\', tempAppName); setSystemAppDesc(tempAppDesc); localStorage.setItem(\'systemAppDesc\', tempAppDesc); setMaintenanceMode(tempMaintenance); localStorage.setItem(\'maintenanceMode\', String(tempMaintenance)); document.title = tempAppName; alert("Settings updated successfully."); }} className="bg-slate-900 text-white rounded-lg px-6 py-3 text-xs font-bold uppercase hover:bg-neutral-800 transition-colors w-full sm:w-auto text-center shadow-sm rounded-xl active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:translate-x-1">Save Changes</button>'
].join('\\n');

content = content.replace(formSource, formReplacement);

content = content.replace(
  'alert("Google Drive Successfully Initialized and Linked.");',
  'getPlatformIntegrations().then(setPlatformIntegrations);\\n                                          alert("Google Drive Successfully Initialized and Linked.");'
);

// We need to use exact matching but the \n might differ depending on OS. Let's use simple search replace for the button at least.
fs.writeFileSync('update_general.cjs', content, 'utf8');
