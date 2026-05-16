const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update processFiles
const oldProcessFilesPart = `            if (shouldSync) {
              const token = null;
              if (!targetFolder) {
                // Fallback initialization if Drive wasn't already initialized by admin
                const newRootId = await createFolder(token, 'Elyria_System_Master');
                targetFolder = await createFolder(token, 'External (Submissions)', newRootId);
                
                if (!driveConfig) {
                  await createPlatformIntegration({
                    name: \`Drive Linked (Central Service)\`,
                    type: 'GOOGLE_DRIVE',
                    status: 'ACTIVE',
                    config: { rootId: newRootId, submissionsId: targetFolder, owner: 'Central Service' },
                    createdAt: new Date().toISOString()
                  });
                }
              }
              const { findFolderByName } = await import('./services/driveService');
              actualFolderToUpload = await findFolderByName(token, submissionFolderName);
              if (!actualFolderToUpload) {
                 actualFolderToUpload = await createFolder(token, submissionFolderName, targetFolder);
              }
            }`;

const newProcessFilesPart = `            if (shouldSync) {
              const token = null;
              if (!targetFolder) {
                // Fallback initialization if Drive wasn't already initialized by admin
                const newRootId = await createFolder(token, 'Elyria_System_Master');
                targetFolder = await createFolder(token, 'External (Submissions)', newRootId);
                
                if (!driveConfig) {
                  await createPlatformIntegration({
                    name: \`Drive Linked (Central Service)\`,
                    type: 'GOOGLE_DRIVE',
                    status: 'ACTIVE',
                    config: { rootId: newRootId, submissionsId: targetFolder, owner: 'Central Service' },
                    createdAt: new Date().toISOString()
                  });
                }
              }
              const { getSubmission, updateSubmission } = await import('./services/rfxService');
              const sub = await getSubmission(submissionId!);
              actualFolderToUpload = sub?.driveFolderId || null;
              if (!actualFolderToUpload) {
                 const titleSafe = sub?.title?.replace(/[^a-zA-Z0-9 -_]/g, '') || "Untitled";
                 actualFolderToUpload = await createFolder(token, \`\${titleSafe} [\${submissionId?.slice(-5)}]\`, targetFolder);
                 if (sub && submissionId) {
                    await updateSubmission(submissionId, { driveFolderId: actualFolderToUpload });
                 }
              }
            }`;

content = content.replace(oldProcessFilesPart, newProcessFilesPart);

const handleQuickIngestBulkOld = `        const integrations = await getPlatformIntegrations();
        const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
        let targetFolder = driveConfig?.config?.submissionsId || driveConfig?.config?.rootId;
        
        let shouldSync = false;
        if (targetFolder || userProfile?.role === 'ADMIN' || userProfile?.role === 'OWNER') {
             shouldSync = window.confirm(
               \`Do you want to sync these \${files.length} documents to Google Drive?\${!targetFolder ? '\\n\\nNote: Google Drive is not fully configured. We will initialize it if you proceed.' : ''}\`
             );
        }

        if (shouldSync) {
             const token = null;
             try {
                if (!targetFolder) {
                  const newRootId = await createFolder(token, 'Elyria_System_Master');
                  targetFolder = await createFolder(token, 'External (Submissions)', newRootId);
                  
                  if (!driveConfig) {
                    await createPlatformIntegration({
                      name: \`Drive Linked (Central Service)\`,
                      type: 'GOOGLE_DRIVE',
                      status: 'ACTIVE',
                      config: { rootId: newRootId, submissionsId: targetFolder, owner: 'Central Service' },
                      createdAt: new Date().toISOString()
                    });
                  }
                }
                const { findFolderByName } = await import('./services/driveService');
                const submissionFolderName = \`Submission_\${subId}\`;
                let actualFolderToUpload = await findFolderByName(token, submissionFolderName);
                if (!actualFolderToUpload) {
                   actualFolderToUpload = await createFolder(token, submissionFolderName, targetFolder);
                }

                // Upload each file`;

const handleQuickIngestBulkNew = `        const integrations = await getPlatformIntegrations();
        const driveConfig = integrations.find(i => i.type === 'GOOGLE_DRIVE');
        let targetFolder = driveConfig?.config?.submissionsId || driveConfig?.config?.rootId;
        
        let shouldSync = false;
        if (targetFolder || userProfile?.role === 'ADMIN' || userProfile?.role === 'OWNER') {
             shouldSync = window.confirm(
               \`Do you want to sync these \${files.length} documents to Google Drive?\${!targetFolder ? '\\n\\nNote: Google Drive is not fully configured. We will initialize it if you proceed.' : ''}\`
             );
        }

        if (shouldSync) {
             const token = null;
             try {
                if (!targetFolder) {
                  const newRootId = await createFolder(token, 'Elyria_System_Master');
                  targetFolder = await createFolder(token, 'External (Submissions)', newRootId);
                  
                  if (!driveConfig) {
                    await createPlatformIntegration({
                      name: \`Drive Linked (Central Service)\`,
                      type: 'GOOGLE_DRIVE',
                      status: 'ACTIVE',
                      config: { rootId: newRootId, submissionsId: targetFolder, owner: 'Central Service' },
                      createdAt: new Date().toISOString()
                    });
                  }
                }
                const currentSub = await getSubmission(subId!);
                let actualFolderToUpload = currentSub?.driveFolderId || null;
                if (!actualFolderToUpload) {
                   const titleSafe = currentSub?.title?.replace(/[^a-zA-Z0-9 -_]/g, '') || "Untitled";
                   actualFolderToUpload = await createFolder(token, \`\${titleSafe} [\${subId!.slice(-5)}]\`, targetFolder);
                   if (currentSub && subId) {
                      await updateSubmission(subId!, { driveFolderId: actualFolderToUpload });
                   }
                }

                // Upload each file`;

content = content.replace(handleQuickIngestBulkOld, handleQuickIngestBulkNew);

fs.writeFileSync('src/App.tsx', content);
