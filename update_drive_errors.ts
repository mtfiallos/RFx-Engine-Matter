import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.split('console.warn("Drive sync skipped, user cancelled auth or error:", e);').join('handleDriveError(e, "Drive Upload/Sync");');

fs.writeFileSync('src/App.tsx', content, 'utf8');
