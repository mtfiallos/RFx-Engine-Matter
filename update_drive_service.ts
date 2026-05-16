import fs from 'fs';

let content = fs.readFileSync('src/services/driveService.ts', 'utf8');

content = content.replace(
  "throw new Error('Failed to create folder in Google Drive');",
  "const errBody = await response.text(); console.error('Drive API Error:', errBody); throw new Error('Failed to create folder in Google Drive: ' + errBody);"
);

content = content.replace(
  "throw new Error('Failed to upload file to Google Drive');",
  "const errBody = await response.text(); console.error('Drive API Error (Upload):', errBody); throw new Error('Failed to upload file to Google Drive: ' + errBody);"
);

fs.writeFileSync('src/services/driveService.ts', content, 'utf8');
