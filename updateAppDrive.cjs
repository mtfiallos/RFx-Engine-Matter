const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const handleCreateOld = `  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const newId = await createSubmission(newTitle);
      
      const integrations = await getPlatformIntegrations();
      const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
      if (driveConfig?.config?.submissionsId) {
          try {
             const token = null;

             if (true) {
                 const { createFolder } = await import('./services/driveService');
                 await createFolder(token, \`Submission_\${newId}\`, driveConfig.config.submissionsId);
             }
          } catch(e) {
             console.warn("Could not auto-create drive folder:", e);
          }
      }

      setNewTitle('');
      setIsCreating(false);
    } catch (err: any) {
      setErrorHeader({ message: "Failed to create submission.", details: err.message, nextSteps: "Please check your network connection and try again." });
    }
  };`;

const handleCreateNew = `  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      
      const integrations = await getPlatformIntegrations();
      const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
      let driveFolderId = undefined;
      if (driveConfig?.config?.submissionsId) {
          try {
             const token = null;

             if (true) {
                 const { createFolder } = await import('./services/driveService');
                 // Use real title plus a short random id so they are unique
                 const titleSafe = newTitle.replace(/[^a-zA-Z0-9 -_]/g, '');
                 driveFolderId = await createFolder(token, \`\${titleSafe} [\${Date.now().toString().slice(-5)}]\`, driveConfig.config.submissionsId);
             }
          } catch(e) {
             console.warn("Could not auto-create drive folder:", e);
          }
      }

      const newId = await createSubmission(newTitle, '', driveFolderId);

      setNewTitle('');
      setIsCreating(false);
    } catch (err: any) {
      setErrorHeader({ message: "Failed to create submission.", details: err.message, nextSteps: "Please check your network connection and try again." });
    }
  };`;

content = content.replace(handleCreateOld, handleCreateNew);

fs.writeFileSync('src/App.tsx', content);
