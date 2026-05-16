const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "{['general', 'manifest', 'users', 'integrations', ...(user?.email === 'recirc@gmail.com' ? ['system_tasks'] : [])].map((sec) => (",
  "{['general', 'manifest', 'users', 'integrations', 'drive', ...(user?.email === 'recirc@gmail.com' ? ['system_tasks'] : [])].map((sec) => ("
);

content = content.replace(
  "sec === 'manifest' ? 'Project Files / Manifest' : sec === 'users' ? 'User Management' : sec === 'system_tasks' ? 'System Roadmap' : sec",
  "sec === 'manifest' ? 'Project Files / Manifest' : sec === 'users' ? 'User Management' : sec === 'system_tasks' ? 'System Roadmap' : sec === 'drive' ? 'Storage & Drive' : sec"
);

// We need to find the `<div className="bg-white rounded-xl border border-neutral-200 rounded-lg p-6 shadow-sm rounded-xl mt-6">` that wraps Google Drive Engine Master and pull it out.
// Let's use indexOf to find it.
const driveHeaderPos = content.indexOf('<h4 className="font-bold text-sm uppercase">Google Drive Engine Master</h4>');
if (driveHeaderPos !== -1) {
    // Find the enclosing div
    let startDiv = content.lastIndexOf('<div className="bg-white rounded-xl border border-neutral-200 rounded-lg p-6 shadow-sm rounded-xl mt-6">', driveHeaderPos);
    if (startDiv !== -1) {
        // Find closing div. This is tricky. Let's just find "Drive Unlinked. System running in volatile mode."
        const driveEndIndicator = content.indexOf('Drive Unlinked. System running in volatile mode.', startDiv);
        let endDiv = content.indexOf('</div>', driveEndIndicator); 
        // We know there are a few closing div tags after the tr. Let's be precise.
        
        let extracted = content.substring(startDiv, content.indexOf('{configSection === \\'system_tasks\\'', startDiv));
        // We need to find exactly where the `</div>\\n                        </div>\\n                     )}` is for integrations.
        // Let's split content by lines and move lines.
    }
}
