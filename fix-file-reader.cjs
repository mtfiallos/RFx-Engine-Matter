const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// For line 1096-1105 block (handleFileUpload)
code = code.replace(
    /if \(file\.type\.startsWith\('text\/'\)[^{]*\{\s*reader\.readAsText\(file\);\s*\} else \{\s*reader\.readAsText\(new Blob\(\['\[Binary content - Intelligence extraction from metadata only\]'\]\)\);\s*\}/g,
    `if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) { reader.readAsText(file); } else { reader.readAsDataURL(file); }`
);

// Specifically for line 3857 (content slicing)
code = code.replace(
    /content: content\.slice\(0, 500\) \|\| '\[AUTOMATED INGEST\]',/g,
    'content: content || \'[AUTOMATED INGEST]\','
);

fs.writeFileSync('src/App.tsx', code);
