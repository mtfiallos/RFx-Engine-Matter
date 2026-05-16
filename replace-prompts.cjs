const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(
    /const url = prompt\("Enter Google Chat Webhook URL:"\);[\s\S]*?setPlatformIntegrations\(integrations\);\s*}\s*}/,
    'setShowGchatInput(true);\n                                         }'
);
code = code.replace(
    /const emailPrefix = prompt\("Enter a system email prefix \(e\.g\. 'rfps', 'bids'\):", "rfps"\);[\s\S]*?setTimeout\(\(\) => setGlobalLoadingMsg\(null\), 2000\);\s*}\s*}/,
    'setShowEmailInput(true);\n                                         }'
);
fs.writeFileSync('src/App.tsx', code);
