const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `          {!readOnly && (
            <>
              
              <Tooltip content="Select or Deselect All Files">`;

const replaceStr = `          {!readOnly && (
            <div className="flex items-center gap-2">
              
              <Tooltip content="Select or Deselect All Files">`;

const targetStr2 = `              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files) handleFileUpload(e.target.files, null, setUploadProgresses);
                  e.target.value = '';
                }} 
              />
            </>`;

const replaceStr2 = `              <input 
                ref={fileInputRef}
                type="file" 
                multiple 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files) handleFileUpload(e.target.files, null, setUploadProgresses);
                  e.target.value = '';
                }} 
              />
            </div>`;

content = content.replace(targetStr, replaceStr);
content = content.replace(targetStr2, replaceStr2);

fs.writeFileSync('src/App.tsx', content);
