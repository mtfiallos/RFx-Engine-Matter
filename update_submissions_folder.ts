import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add states for Submissions Drive Subfolders
const stateTarget = `  const [driveDetailsExpanded, setDriveDetailsExpanded] = useState<string | null>(null);
  const [driveSubfolders, setDriveSubfolders] = useState<any[]>([]);`;
const stateReplacement = `  const [driveDetailsExpanded, setDriveDetailsExpanded] = useState<string | null>(null);
  const [driveSubfolders, setDriveSubfolders] = useState<any[]>([]);
  const [driveDetailsExpandedSubmissions, setDriveDetailsExpandedSubmissions] = useState<string | null>(null);
  const [driveSubfoldersSubmissions, setDriveSubfoldersSubmissions] = useState<any[]>([]);`;
content = content.replace(stateTarget, stateReplacement);

// 2. Add subfolders UI in drive config table for Submissions
const subTarget = `                                      <div>Submissions: {k.config?.submissionsId ? <span className="text-green-600">Linked</span> : <span className="text-yellow-600">Needs Validation</span>}</div>`;
const subReplacement = `                                      <div>Submissions: {k.config?.submissionsId ? <span className="text-green-600">Linked</span> : <span className="text-yellow-600">Needs Validation</span>}
                                        {k.config?.submissionsId && (
                                           <div className="ml-2 mt-1 mb-1">
                                             <button onClick={async () => {
                                               try {
                                                 const driveResult = await linkGoogleDrive();
                                                 if (driveResult) {
                                                   const credential = GoogleAuthProvider.credentialFromResult(driveResult);
                                                   const token = credential?.accessToken;
                                                   if (!token) return;
                                                   const { getFolderContents } = await import('./services/driveService');
                                                   const contents = await getFolderContents(token, k.config.submissionsId);
                                                   setDriveSubfoldersSubmissions(contents);
                                                   setDriveDetailsExpandedSubmissions(driveDetailsExpandedSubmissions === k.id ? null : k.id);
                                                 }
                                               } catch(e) {
                                                 handleDriveError(e, "Viewing Subfolders");
                                               }
                                             }} className="underline text-purple-600 hover:text-purple-800 transition-colors uppercase font-bold text-[9px] tracking-wider bg-purple-50 px-2 py-0.5 rounded">
                                               {driveDetailsExpandedSubmissions === k.id ? 'Hide Subfolders' : 'View Package Subfolders'}
                                             </button>
                                             {driveDetailsExpandedSubmissions === k.id && (
                                                <div className="mt-1 pl-2 border-l-2 border-purple-400 opacity-80 grid gap-1">
                                                  {driveSubfoldersSubmissions.map(sf => <div key={sf.id} className="flex gap-2">✓ {sf.name}</div>)}
                                                  {driveSubfoldersSubmissions.length === 0 && <div className="text-red-500">No subfolders found</div>}
                                                </div>
                                             )}
                                           </div>
                                        )}
                                      </div>`;

content = content.replace(subTarget, subReplacement);

// 3. Drive Folder creation on new Submission
const createTarget = `    try {
      await createSubmission(newTitle);
      setNewTitle('');
      setIsCreating(false);
    } catch (err: any) {`;

const createReplacement = `    try {
      await createSubmission(newTitle);
      
      const integrations = await getPlatformIntegrations();
      const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
      if (driveConfig?.config?.submissionsId) {
          try {
             const driveResult = await linkGoogleDrive();
             if (driveResult) {
               const credential = GoogleAuthProvider.credentialFromResult(driveResult);
               const token = credential?.accessToken;
               if (token) {
                 const { createFolder } = await import('./services/driveService');
                 await createFolder(token, newTitle, driveConfig.config.submissionsId);
               }
             }
          } catch(e) {
             console.warn("Could not auto-create drive folder:", e);
          }
      }

      setNewTitle('');
      setIsCreating(false);
    } catch (err: any) {`;

content = content.replace(createTarget, createReplacement);

fs.writeFileSync('src/App.tsx', content, 'utf8');
