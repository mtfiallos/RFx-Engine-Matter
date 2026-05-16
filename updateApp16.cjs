const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldRemoveFallback = `        // Fallback for old files without a stored driveFileId
        try {
           const { findFolderByName, getFolderContents, deleteFile } = await import('./services/driveService');
           const folderId = await findFolderByName(null, \`Submission_\${submissionId}\`);
           if (folderId) {
             const contents = await getFolderContents(null, folderId);
             const driveFile = contents.find((f: any) => f.name === fileToRemove.name);
             if (driveFile) {
               await deleteFile(null, driveFile.id);
             }
           }
        } catch(e) {
           console.warn('Could not delete fallback file from drive', e);
        }`;

const newRemoveFallback = `        // Fallback for old files
        try {
           const { getSubmission } = await import('./services/rfxService');
           const sub = await getSubmission(submissionId!);
           let folderId = sub?.driveFolderId;
           const { findFolderByName, getFolderContents, deleteFile } = await import('./services/driveService');
           if (!folderId) folderId = await findFolderByName(null, \`Submission_\${submissionId}\`);
           
           if (folderId) {
             const contents = await getFolderContents(null, folderId);
             const driveFile = contents.find((f: any) => f.name === fileToRemove.name);
             if (driveFile) {
               await deleteFile(null, driveFile.id);
             }
           }
        } catch(e) {
           console.warn('Could not delete fallback file from drive', e);
        }`;

content = content.replace(oldRemoveFallback, newRemoveFallback);


const deleteSubmissionOld = `    try {
      try {
        const { findFolderByName, deleteFile } = await import('./services/driveService');
        const folderId = await findFolderByName(null, \`Submission_\${deleteConfirmId}\`);
        if (folderId) {
           await deleteFile(null, folderId);
        }
      } catch(err) {
        console.warn("Could not delete submission folder from drive", err);
      }

      await deleteSubmission(deleteConfirmId);`;

const deleteSubmissionNew = `    try {
      try {
        const { getSubmission } = await import('./services/rfxService');
        const subForDel = await getSubmission(deleteConfirmId);
        const { findFolderByName, deleteFile } = await import('./services/driveService');
        let folderId = subForDel?.driveFolderId;
        if (!folderId) folderId = await findFolderByName(null, \`Submission_\${deleteConfirmId}\`);
        if (folderId) {
           await deleteFile(null, folderId);
        }
      } catch(err) {
        console.warn("Could not delete submission folder from drive", err);
      }

      await deleteSubmission(deleteConfirmId);`;

content = content.replace(deleteSubmissionOld, deleteSubmissionNew);

const bulkDeleteOld = `        try {
          const { findFolderByName, deleteFile } = await import('./services/driveService');
          for (const id of idsToDelete) {
             const folderId = await findFolderByName(null, \`Submission_\${id}\`);
             if (folderId) {
                try {
                  await deleteFile(null, folderId);
                } catch(e) {
                  console.warn("Could not delete from drive", e);
                }
             }
          }
        } catch(e) {
          console.warn("Could not delete from drive", e);
        }`;

const bulkDeleteNew = `        try {
          const { getSubmission } = await import('./services/rfxService');
          const { findFolderByName, deleteFile } = await import('./services/driveService');
          for (const id of idsToDelete) {
             const subDel = await getSubmission(id);
             let folderId = subDel?.driveFolderId;
             if (!folderId) folderId = await findFolderByName(null, \`Submission_\${id}\`);
             if (folderId) {
                try {
                  await deleteFile(null, folderId);
                } catch(e) {
                  console.warn("Could not delete from drive", e);
                }
             }
          }
        } catch(e) {
          console.warn("Could not delete from drive", e);
        }`;

content = content.replace(bulkDeleteOld, bulkDeleteNew);

fs.writeFileSync('src/App.tsx', content);
