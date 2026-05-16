import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// The new block to replace `else { alert... }`
const syncCode = `                                       } else {
                                          alert(\`Google Drive Access Granted for \${driveResult.user.email}. Validating folder structure...\`);
                                          const { getFolderContents } = await import('./services/driveService');
                                          let updatedConfig = { ...driveConfig.config };
                                          let needsUpdate = false;
                                          let notifications = [];

                                          // Check Internal structure if internalId exists
                                          if (updatedConfig.internalId) {
                                              const internalContents = await getFolderContents(token, updatedConfig.internalId);
                                              const requiredInternal = ['Manifest Files', 'GEMs', 'Prompts', 'Instructions', 'Templates', 'System Config'];
                                              for (const folderName of requiredInternal) {
                                                if (!internalContents.some((f: any) => f.name === folderName)) {
                                                  await createFolder(token, folderName, updatedConfig.internalId);
                                                  notifications.push(\`Created missing internal folder: \${folderName}\`);
                                                }
                                              }
                                          } else {
                                              if (updatedConfig.rootId) {
                                                updatedConfig.internalId = await createFolder(token, 'Internal', updatedConfig.rootId);
                                                const requiredInternal = ['Manifest Files', 'GEMs', 'Prompts', 'Instructions', 'Templates', 'System Config'];
                                                for (const folderName of requiredInternal) {
                                                  await createFolder(token, folderName, updatedConfig.internalId);
                                                  notifications.push(\`Created internal folder: \${folderName}\`);
                                                }
                                                needsUpdate = true;
                                              }
                                          }

                                          // Check Submissions folder
                                          if (!updatedConfig.submissionsId && updatedConfig.rootId) {
                                              updatedConfig.submissionsId = await createFolder(token, 'External (Submissions)', updatedConfig.rootId);
                                              notifications.push('Created missing Submissions folder.');
                                              needsUpdate = true;
                                          }

                                          if (needsUpdate) {
                                            const { updatePlatformIntegration } = await import('./services/platformIntegrationService');
                                            await updatePlatformIntegration(driveConfig.id, { config: updatedConfig });
                                            getPlatformIntegrations().then(setPlatformIntegrations);
                                          }
                                          
                                          if (notifications.length > 0) {
                                            alert(\`Validation Complete:\\n\${notifications.join('\\n')}\`);
                                          } else {
                                            alert('Validation Complete: All required folder structures are intact.');
                                          }
                                       }`;

content = content.replace(
  `                                       } else {
                                          alert(\`Google Drive Access Granted for \${driveResult.user.email}.\`);
                                       }`,
  syncCode
);

// We also need to update the table to show connected account email, root ID, and indicate if internal and submissions are detected
const oldTableCode = `                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="uppercase opacity-60">
                                  <th className="pb-2">Account</th>
                                  <th className="pb-2">Storage Root ID</th>
                                  <th className="pb-2">Status</th>
                                  <th className="pb-2 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {platformIntegrations.filter(i => i.type === 'GOOGLE_DRIVE').map(k => (
                                  <tr key={k.id} className="border-t border-black/10">
                                    <td className="py-3 font-bold">{k.config?.owner || 'Unknown'}</td>
                                    <td className="py-3 opacity-60 font-mono text-[10px]">{k.config?.rootId}</td>
                                    <td className="py-3 text-green-600 font-bold uppercase">{k.status}</td>
                                    <td className="py-3 text-right">
                                      <button 
                                        className="text-red-600 underline" 
                                        onClick={() => {
                                          if(window.confirm(\`Unlink System Drive?\`)) {
                                            deletePlatformIntegration(k.id).then(() => getPlatformIntegrations().then(setPlatformIntegrations));
                                          }
                                        }}
                                      >
                                        Unlink
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {platformIntegrations.filter(i => i.type === 'GOOGLE_DRIVE').length === 0 && (
                                  <tr className="border-t border-black/10">
                                    <td colSpan={4} className="py-6 text-center opacity-60 font-mono text-xs">Drive Unlinked. System running in volatile mode.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>`;

const newTableCode = `                            <table className="w-full text-xs text-left">
                              <thead>
                                <tr className="uppercase opacity-60">
                                  <th className="pb-2">Account</th>
                                  <th className="pb-2">Paths Detected</th>
                                  <th className="pb-2">Status</th>
                                  <th className="pb-2 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {platformIntegrations.filter(i => i.type === 'GOOGLE_DRIVE').map(k => (
                                  <tr key={k.id} className="border-t border-black/10">
                                    <td className="py-3 font-bold">{k.config?.owner || 'Unknown'}</td>
                                    <td className="py-3 opacity-60 font-mono text-[10px]">
                                      Root: {k.config?.rootId || <span className="text-red-500">Missing</span>}<br/>
                                      Internal: {k.config?.internalId || <span className="text-yellow-600">Needs Validation</span>}<br/>
                                      Submissions: {k.config?.submissionsId || <span className="text-yellow-600">Needs Validation</span>}
                                    </td>
                                    <td className="py-3 text-green-600 font-bold uppercase">{k.status}</td>
                                    <td className="py-3 text-right">
                                      <button 
                                        className="text-red-600 underline" 
                                        onClick={() => {
                                          if(window.confirm(\`Unlink System Drive?\`)) {
                                            deletePlatformIntegration(k.id).then(() => getPlatformIntegrations().then(setPlatformIntegrations));
                                          }
                                        }}
                                      >
                                        Unlink
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {platformIntegrations.filter(i => i.type === 'GOOGLE_DRIVE').length === 0 && (
                                  <tr className="border-t border-black/10">
                                    <td colSpan={4} className="py-6 text-center opacity-60 font-mono text-xs">Drive Unlinked. System running in volatile mode.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>`;

content = content.replace(oldTableCode, newTableCode);

fs.writeFileSync('src/App.tsx', content, 'utf8');
