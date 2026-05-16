const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const gchatInline = `</button>
                                  </div>
                                  {showGchatInput && !platformIntegrations.some(i => i.type === 'SERVICE' && i.name === 'GoogleChat') && (
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
                                  )}
                                </div>

                                <div className="flex flex-col gap-2 p-3 border border-neutral-200 rounded-md">`;

code = code.replace(/<\/button>\s*<\/div>\s*<\/div>\s*<div className="flex flex-col gap-2 p-3 border border-neutral-200 rounded-md">\s*<div className="flex items-center justify-between">\s*<span className="text-xs font-mono font-bold flex items-center gap-2">\s*<Mail size={16}/, gchatInline.split('<div className="flex flex-col gap-2 p-3')[0] + '<div className="flex flex-col gap-2 p-3 border border-neutral-200 rounded-md">\n                                  <div className="flex items-center justify-between">\n                                     <span className="text-xs font-mono font-bold flex items-center gap-2">\n                                         <Mail size={16}');

const emailInline = `</button>
                                  </div>
                                  {showEmailInput && !platformIntegrations.some(i => i.type === 'EMAIL_INBOUND') && (
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
                                  )}`;

code = code.replace(/<\/button>\s*<\/div>\s*{platformIntegrations\.some\(i => i\.type === 'EMAIL_INBOUND'\)/, emailInline + '\n                                  {platformIntegrations.some(i => i.type === \'EMAIL_INBOUND\')');

fs.writeFileSync('src/App.tsx', code);
