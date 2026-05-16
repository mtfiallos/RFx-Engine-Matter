const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the first occurrence (RegistersManager context, has submissionId)
content = content.replace(
  `                }
                await uploadFileToDrive(token, file, targetFolder);`,
  `                }
                const { findFolderByName } = await import('./services/driveService');
                const submissionFolderName = \`Submission_\${submissionId}\`;
                let actualFolderToUpload = await findFolderByName(token, submissionFolderName);
                if (!actualFolderToUpload) {
                   actualFolderToUpload = await createFolder(token, submissionFolderName, targetFolder);
                }
                await uploadFileToDrive(token, file, actualFolderToUpload);`
);

// We need to replace the second occurance for Quick Ingest (context has subId)
content = content.replace(
  `                }
                await uploadFileToDrive(token, file, targetFolder);`,
  `                }
                const { findFolderByName } = await import('./services/driveService');
                const submissionFolderName = \`Submission_\${subId}\`;
                let actualFolderToUpload = await findFolderByName(token, submissionFolderName);
                if (!actualFolderToUpload) {
                   actualFolderToUpload = await createFolder(token, submissionFolderName, targetFolder);
                }
                await uploadFileToDrive(token, file, actualFolderToUpload);`
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
