const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `              <input 
                ref={fileInputRef}
                type="file" 
                multiple
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </>`;

const replaceStr = `              <input 
                ref={fileInputRef}
                type="file" 
                multiple
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </div>`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/App.tsx', content);
