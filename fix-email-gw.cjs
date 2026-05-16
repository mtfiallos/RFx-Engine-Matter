const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const emailInline = `{platformIntegrations.some(i => i.type === 'EMAIL_INBOUND') ? (
                                    <div className="flex flex-col gap-2 mt-2 border-t border-neutral-100 pt-2">
                                        <div className="flex justify-between items-center bg-neutral-50 px-2 py-1 rounded border border-neutral-200">
                                            <span className="text-xs font-mono text-neutral-600">{platformIntegrations.find(i => i.type === 'EMAIL_INBOUND')?.config?.emailAddress}</span>
                                        </div>
                                        {showEmailInput ? (
                                          <div className="flex flex-col gap-2">
                                              <input type="text" value={emailInputValue} onChange={e => setEmailInputValue(e.target.value)} placeholder="System email prefix (e.g. 'rfps')" className="w-full text-xs font-mono border border-neutral-200 rounded p-1.5 text-black" />
                                              <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => setShowEmailInput(false)} className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500">Cancel</button>
                                                <button onClick={async () => {
                                                  if (emailInputValue) {
                                                      const exists = platformIntegrations.find(i => i.type === 'EMAIL_INBOUND');
                                                      const fullEmail = \`\${emailInputValue.toLowerCase().replace(/[^a-z0-9]/g, '')}-\${Math.floor(Math.random()*10000)}@elyria-system.inbound\`;
                                                      const { updatePlatformIntegration } = await import('./services/platformIntegrationService');
                                                      await updatePlatformIntegration(exists.id, {
                                                          config: { emailAddress: fullEmail }
                                                      });
                                                      const integrations = await (await import('./services/platformIntegrationService')).getPlatformIntegrations();
                                                      setPlatformIntegrations(integrations);
                                                      setShowEmailInput(false);
                                                  }
                                                }} className="px-3 py-1 text-[10px] border border-blue-600 uppercase font-bold text-white bg-blue-600 rounded">Update Prefix</button>
                                              </div>
                                          </div>
                                        ) : (
                                          <div className="flex gap-2 justify-end mt-2">
                                            <button onClick={() => {
                                                const exists = platformIntegrations.find(i => i.type === 'EMAIL_INBOUND');
                                                if(exists) setEmailInputValue(exists.config?.emailAddress?.split('-')[0] || '');
                                                setShowEmailInput(true);
                                            }} className="px-3 py-1 text-[10px] uppercase font-bold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded">Edit Prefix</button>
                                            
                                            <button onClick={async () => {
                                                const exists = platformIntegrations.find(i => i.type === 'EMAIL_INBOUND');
                                                if (exists && confirm("Remove Inbound Email Integration?")) {
                                                    const { deletePlatformIntegration } = await import('./services/platformIntegrationService');
                                                    await deletePlatformIntegration(exists.id);
                                                    const integrations = await (await import('./services/platformIntegrationService')).getPlatformIntegrations();
                                                    setPlatformIntegrations(integrations);
                                                }
                                            }} className="px-3 py-1 text-[10px] border border-red-200 uppercase font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded">Remove</button>
                                          </div>
                                        )}
                                    </div>
                                  ) : (
                                    showEmailInput && !platformIntegrations.some(i => i.type === 'EMAIL_INBOUND') && (
                                     <div className="flex flex-col gap-2 mt-2 border-t border-neutral-100 pt-2">
                                        <input type="text" value={emailInputValue} onChange={e => setEmailInputValue(e.target.value)} placeholder="System email prefix (e.g. 'rfps')" className="w-full text-xs font-mono border border-neutral-200 rounded p-1.5 text-black" />
                                        <div className="flex justify-end gap-2">
                                           <button onClick={() => setShowEmailInput(false)} className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500">Cancel</button>
                                           <button onClick={async () => {
                                              if (emailInputValue) {
                                                  const fullEmail = \`\${emailInputValue.toLowerCase().replace(/[^a-z0-9]/g, '')}-\${Math.floor(Math.random()*10000)}@elyria-system.inbound\`;
                                                  const { createPlatformIntegration } = await import('./services/platformIntegrationService');
                                                  await createPlatformIntegration({
                                                      name: 'System Email Gateway',
                                                      type: 'EMAIL_INBOUND',
                                                      status: 'ACTIVE',
                                                      config: { emailAddress: fullEmail },
                                                      createdAt: new Date().toISOString()
                                                  });
                                                  const integrations = await (await import('./services/platformIntegrationService')).getPlatformIntegrations();
                                                  setPlatformIntegrations(integrations);
                                                  setShowEmailInput(false);
                                              }
                                           }} className="px-3 py-1 text-[10px] border border-blue-600 uppercase font-bold text-white bg-blue-600 rounded">Provision Domain</button>
                                        </div>
                                     </div>
                                    )
                                  )}`;

code = code.replace(/{showEmailInput && !platformIntegrations\.some\(i => i\.type === 'EMAIL_INBOUND'\) && \([\s\S]*?\n\s*\)}/, emailInline);

const gchatInline = `{platformIntegrations.some(i => i.type === 'SERVICE' && i.name === 'GoogleChat') ? (
                                    <div className="flex flex-col gap-2 mt-2 border-t border-neutral-100 pt-2">
                                        <div className="flex justify-between items-center bg-neutral-50 px-2 py-1 rounded border border-neutral-200">
                                            <span className="text-xs font-mono text-neutral-600 truncate mr-2" title={platformIntegrations.find(i => i.type === 'SERVICE' && i.name === 'GoogleChat')?.config?.webhookUrl}>{platformIntegrations.find(i => i.type === 'SERVICE' && i.name === 'GoogleChat')?.config?.webhookUrl}</span>
                                        </div>
                                        {showGchatInput ? (
                                          <div className="flex flex-col gap-2">
                                              <input type="text" value={gchatInputValue} onChange={e => setGchatInputValue(e.target.value)} placeholder="Google Chat Webhook URL" className="w-full text-xs font-mono border border-neutral-200 rounded p-1.5 text-black" />
                                              <div className="flex justify-end gap-2 mt-2">
                                                <button onClick={() => setShowGchatInput(false)} className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500">Cancel</button>
                                                <button onClick={async () => {
                                                  if (gchatInputValue) {
                                                      const exists = platformIntegrations.find(i => i.type === 'SERVICE' && i.name === 'GoogleChat');
                                                      const { updatePlatformIntegration } = await import('./services/platformIntegrationService');
                                                      await updatePlatformIntegration(exists.id, {
                                                          config: { webhookUrl: gchatInputValue }
                                                      });
                                                      const integrations = await (await import('./services/platformIntegrationService')).getPlatformIntegrations();
                                                      setPlatformIntegrations(integrations);
                                                      setShowGchatInput(false);
                                                  }
                                                }} className="px-3 py-1 text-[10px] border border-green-600 uppercase font-bold text-white bg-green-600 rounded">Update Webhook</button>
                                              </div>
                                          </div>
                                        ) : (
                                          <div className="flex gap-2 justify-end mt-2">
                                            <button onClick={() => {
                                                const exists = platformIntegrations.find(i => i.type === 'SERVICE' && i.name === 'GoogleChat');
                                                if(exists) setGchatInputValue(exists.config?.webhookUrl || '');
                                                setShowGchatInput(true);
                                            }} className="px-3 py-1 text-[10px] uppercase font-bold text-green-600 border border-green-200 bg-green-50 hover:bg-green-100 rounded">Edit Webhook</button>
                                            
                                            <button onClick={async () => {
                                                const exists = platformIntegrations.find(i => i.type === 'SERVICE' && i.name === 'GoogleChat');
                                                if (exists && confirm("Remove Google Chat Integration?")) {
                                                    const { deletePlatformIntegration } = await import('./services/platformIntegrationService');
                                                    await deletePlatformIntegration(exists.id);
                                                    const integrations = await (await import('./services/platformIntegrationService')).getPlatformIntegrations();
                                                    setPlatformIntegrations(integrations);
                                                }
                                            }} className="px-3 py-1 text-[10px] border border-red-200 uppercase font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded">Remove</button>
                                          </div>
                                        )}
                                    </div>
                                  ) : (
                                    showGchatInput && !platformIntegrations.some(i => i.type === 'SERVICE' && i.name === 'GoogleChat') && (
                                    <div className="flex flex-col gap-2 mt-2 border-t border-neutral-100 pt-2">
                                       <input type="text" value={gchatInputValue} onChange={e => setGchatInputValue(e.target.value)} placeholder="Google Chat Webhook URL" className="w-full text-xs font-mono border border-neutral-200 rounded p-1.5 text-black" />
                                       <div className="flex justify-end gap-2">
                                          <button onClick={() => setShowGchatInput(false)} className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500">Cancel</button>
                                          <button onClick={async () => {
                                             if (gchatInputValue) {
                                                 const { createPlatformIntegration } = await import('./services/platformIntegrationService');
                                                 await createPlatformIntegration({
                                                     name: 'GoogleChat',
                                                     type: 'SERVICE',
                                                     status: 'ACTIVE',
                                                     config: { webhookUrl: gchatInputValue },
                                                     createdAt: new Date().toISOString()
                                                 });
                                                 const integrations = await (await import('./services/platformIntegrationService')).getPlatformIntegrations();
                                                 setPlatformIntegrations(integrations);
                                                 setShowGchatInput(false);
                                             }
                                          }} className="px-3 py-1 text-[10px] border border-green-600 uppercase font-bold text-white bg-green-600 rounded">Save Settings</button>
                                       </div>
                                    </div>
                                   )
                                  )}`;

code = code.replace(/{showGchatInput && !platformIntegrations\.some\(i => i\.type === 'SERVICE' && i\.name === 'GoogleChat'\) && \([\s\S]*?\n\s*\)}/, gchatInline);

// Remove the onClick prompt for existing configured elements
code = code.replace(
  /className=\{`px-3 py-1 text-\[9px\] uppercase font-bold text-center border rounded-md \$\{platformIntegrations\.some\(i => i\.type === 'SERVICE' && i\.name === 'GoogleChat'\) \? 'bg-green-100 text-green-800 border-green-300' : 'bg-neutral-100 text-neutral-600'\}`\}\s*onClick=\{async \(\) => \{\s*const exists = platformIntegrations\.find\(i => i\.type === 'SERVICE' && i\.name === 'GoogleChat'\);\s*if \(exists\) \{\s*if \(confirm\("Remove Google Chat Integration\?"\)\) \{\s*const \{ deletePlatformIntegration \} = await import\('\.\/services\/platformIntegrationService'\);\s*await deletePlatformIntegration\(exists\.id\);\s*const integrations = await \(await import\('\.\/services\/platformIntegrationService'\)\)\.getPlatformIntegrations\(\);\s*setPlatformIntegrations\(integrations\);\s*\}\s*\} else \{\s*setShowGchatInput\(true\);\s*\}\s*\}\}/,
  `className={\`px-3 py-1 text-[9px] uppercase font-bold text-center border rounded-md \${platformIntegrations.some(i => i.type === 'SERVICE' && i.name === 'GoogleChat') ? 'bg-green-100 text-green-800 border-green-300' : 'bg-neutral-100 text-neutral-600'}\`}\n                                      onClick={async () => {\n                                         const exists = platformIntegrations.find(i => i.type === 'SERVICE' && i.name === 'GoogleChat');\n                                         if (!exists) {\n                                            setShowGchatInput(true);\n                                         }\n                                      }}`
);

code = code.replace(
  /className=\{`px-3 py-1 text-\[9px\] uppercase font-bold text-center border rounded-md \$\{platformIntegrations\.some\(i => i\.type === 'EMAIL_INBOUND'\) \? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-neutral-100 text-neutral-600'\}`\}\s*onClick=\{async \(\) => \{\s*const exists = platformIntegrations\.find\(i => i\.type === 'EMAIL_INBOUND'\);\s*if \(exists\) \{\s*if \(confirm\("Remove Inbound Email Integration\?"\)\) \{\s*const \{ deletePlatformIntegration \} = await import\('\.\/services\/platformIntegrationService'\);\s*await deletePlatformIntegration\(exists\.id\);\s*const integrations = await \(await import\('\.\/services\/platformIntegrationService'\)\)\.getPlatformIntegrations\(\);\s*setPlatformIntegrations\(integrations\);\s*\}\s*\} else \{\s*setShowEmailInput\(true\);\s*\}\s*\}\}/,
  `className={\`px-3 py-1 text-[9px] uppercase font-bold text-center border rounded-md \${platformIntegrations.some(i => i.type === 'EMAIL_INBOUND') ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-neutral-100 text-neutral-600'}\`}\n                                      onClick={async () => {\n                                        const exists = platformIntegrations.find(i => i.type === 'EMAIL_INBOUND');\n                                        if (!exists) {\n                                           setShowEmailInput(true);\n                                        }\n                                      }}`
);


fs.writeFileSync('src/App.tsx', code);
