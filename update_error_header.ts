import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `              {errorHeader.nextSteps && <span className="text-yellow-200 mt-0.5">Action: {errorHeader.nextSteps}</span>}`,
  `              {errorHeader.nextSteps && <span className="text-yellow-200 mt-0.5">Action: {errorHeader.nextSteps.startsWith('http') ? <a href={errorHeader.nextSteps} target="_blank" rel="noreferrer" className="underline hover:text-white">{errorHeader.nextSteps}</a> : errorHeader.nextSteps}</span>}`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
