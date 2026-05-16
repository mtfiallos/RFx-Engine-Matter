import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `nextSteps: "URL to enable (copy to browser): " + urlMatch[1]`,
  `nextSteps: urlMatch[1]`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
