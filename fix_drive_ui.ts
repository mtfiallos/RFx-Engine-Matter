import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add new states
const stateInjection = `const [searchQuery, setSearchQuery] = useState('');`;
const newState = `const [searchQuery, setSearchQuery] = useState('');
  const [driveDetailsExpanded, setDriveDetailsExpanded] = useState<string | null>(null);
  const [driveSubfolders, setDriveSubfolders] = useState<any[]>([]);
  const [isSyncingDrive, setIsSyncingDrive] = useState(false);`;

content = content.replace(stateInjection, newState);

// 2. Add "Sync Foundation Content" button to Drive Header
const buttonTarget = `                              <button
                                onClick={async () => {
                                  try {`;
const buttonStart = content.lastIndexOf('<div>\n                                <h4 className="font-bold text-sm uppercase">Google Drive Engine Master</h4>');
const buttonsDivStr = `                              <div className="flex gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                     setIsSyncingDrive(true);
                                     const integrations = await getPlatformIntegrations();
                                     const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
                                     if (!driveConfig?.config?.internalId) {
                                        alert("Drive is not linked or Internal folder missing.");
                                        setIsSyncingDrive(false);
                                        return;
                                     }
                                     const driveResult = await linkGoogleDrive();
                                     if (driveResult) {
                                         const credential = GoogleAuthProvider.credentialFromResult(driveResult);
                                         const token = credential?.accessToken;
                                         if (!token) throw new Error("No token");
                                         
                                         const { getFolderContents, uploadFileToDrive } = await import('./services/driveService');
                                         const internals = await getFolderContents(token, driveConfig.config.internalId);
                                         
                                         // 1. Sync Templates
                                         const tempFolder = internals.find((f: any) => f.name === 'Templates');
                                         if (tempFolder) {
                                            for (const t of templates) {
                                                const f = new File(["# " + t.title + "\\n\\n" + t.description], t.title + ".md", { type: "text/markdown" });
                                                await uploadFileToDrive(token, f, tempFolder.id);
                                            }
                                         }
                                         
                                         // 2. Sync Manifests
                                         const manFolder = internals.find((f: any) => f.name === 'Manifest Files');
                                         if (manFolder) {
                                            const f1 = new File([JSON.stringify(MANIFEST, null, 2)], "MANIFEST.json", { type: "application/json" });
                                            await uploadFileToDrive(token, f1, manFolder.id);
                                            const f2 = new File([JSON.stringify(CONTROL_PACK, null, 2)], "CONTROL_PACK.json", { type: "application/json" });
                                            await uploadFileToDrive(token, f2, manFolder.id);
                                            const f3 = new File([JSON.stringify(GEM_CHAIN_LOGIC, null, 2)], "GEM_CHAIN_LOGIC.json", { type: "application/json" });
                                            await uploadFileToDrive(token, f3, manFolder.id);
                                         }
                                         
                                         alert("Initial Sync Complete!");
                                     }
                                  } catch (e: any) {
                                     alert("Sync failed: " + e.message);
                                  } finally {
                                     setIsSyncingDrive(false);
                                  }
                                }}
                                disabled={isSyncingDrive}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-[10px] font-bold transition-all uppercase tracking-widest disabled:opacity-50"
                              >
                                {isSyncingDrive ? 'Syncing...' : 'Sync Foundation Content'}
                              </button>
                              <button
                                onClick={async () => {
                                  try {`;

content = content.replace(buttonTarget, buttonsDivStr.replace('                              <div className="flex gap-2">', '                              <div className="flex gap-2">'));

// Fix missing </div> for the flex container
const endButtonTarget = `                              </button>
                            </div>
                            
                            <table className="w-full text-xs text-left">`;

content = content.replace(endButtonTarget, `                              </button>\n                              </div>\n                            </div>\n                            \n                            <table className="w-full text-xs text-left">`);

// 3. Update the folder view logic in the row
const rowTarget = `                                    <td className="py-3 opacity-60 font-mono text-[10px]">
                                      Root: {k.config?.rootId || <span className="text-red-500">Missing</span>}<br/>
                                      Internal: {k.config?.internalId || <span className="text-yellow-600">Needs Validation</span>}<br/>
                                      Submissions: {k.config?.submissionsId || <span className="text-yellow-600">Needs Validation</span>}
                                    </td>`;

const rowReplacement = `                                    <td className="py-3 font-mono text-[10px] leading-relaxed">
                                      <div>Root: {k.config?.rootId ? <span className="text-green-600">Linked</span> : <span className="text-red-500">Missing</span>} <span className="opacity-50">({k.config?.rootId})</span></div>
                                      <div>Internal: {k.config?.internalId ? <span className="text-green-600">Linked</span> : <span className="text-yellow-600">Needs Validation</span>}
                                        {k.config?.internalId && (
                                           <div className="ml-2 mt-1 mb-1">
                                             <button onClick={async () => {
                                               try {
                                                 const driveResult = await linkGoogleDrive();
                                                 if (driveResult) {
                                                   const credential = GoogleAuthProvider.credentialFromResult(driveResult);
                                                   const token = credential?.accessToken;
                                                   if (!token) return;
                                                   const { getFolderContents } = await import('./services/driveService');
                                                   const contents = await getFolderContents(token, k.config.internalId);
                                                   setDriveSubfolders(contents);
                                                   setDriveDetailsExpanded(driveDetailsExpanded === k.id ? null : k.id);
                                                 }
                                               } catch(e) {}
                                             }} className="underline text-blue-600 hover:text-blue-800 transition-colors uppercase font-bold text-[9px] tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                                               {driveDetailsExpanded === k.id ? 'Hide Subfolders' : 'View Subfolders & Status'}
                                             </button>
                                             {driveDetailsExpanded === k.id && (
                                                <div className="mt-1 pl-2 border-l-2 border-blue-400 opacity-80 grid gap-1">
                                                  {driveSubfolders.map(sf => <div key={sf.id} className="flex gap-2">✓ {sf.name}</div>)}
                                                  {driveSubfolders.length === 0 && <div className="text-red-500">No subfolders found</div>}
                                                </div>
                                             )}
                                           </div>
                                        )}
                                      </div>
                                      <div>Submissions: {k.config?.submissionsId ? <span className="text-green-600">Linked</span> : <span className="text-yellow-600">Needs Validation</span>}</div>
                                    </td>`;

content = content.replace(rowTarget, rowReplacement);

fs.writeFileSync('src/App.tsx', content, 'utf8');
