const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `                    {f.driveFileId ? (
                      <a 
                        href={\`https://drive.google.com/file/d/\${f.driveFileId}/view\`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="font-mono text-[10px] font-bold truncate uppercase hover:underline block" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        {f.name}
                      </a>
                    ) : (
                      <p className="font-mono text-[10px] font-bold truncate uppercase hover:underline cursor-pointer" onClick={(e) => {
                        e.stopPropagation();
                        alert("File not synced to drive yet. Try clicking Sync to Drive in the bottom right context menu.");
                      }}>
                        {f.name}
                      </p>
                    )}`;

const replaceStr = `                    <p 
                      className="font-mono text-[10px] font-bold truncate uppercase hover:underline cursor-pointer" 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (f.driveFileId) {
                          setViewingFile({
                            filename: f.name,
                            driveUrl: \`https://drive.google.com/file/d/\${f.driveFileId}/preview\`
                          });
                        } else {
                          alert("File not synced to drive yet. Try clicking Sync to Drive in the bottom right context menu.");
                        }
                      }}
                    >
                      {f.name}
                    </p>`;

content = content.replace(targetStr, replaceStr);

fs.writeFileSync('src/App.tsx', content);
