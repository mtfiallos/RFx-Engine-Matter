import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/\$\{driveResult\.user\.email\}/g, "Central Service");
content = content.replace(/owner: driveResult\.user\.email/g, "owner: 'Central Service'");

fs.writeFileSync('src/App.tsx', content);
console.log("App.tsx transformed successfully!");
