import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace Block 1 & 3
const block1Pattern = `            const driveResult = await linkGoogleDrive();
            if (driveResult) {
              const credential = GoogleAuthProvider.credentialFromResult(driveResult);
                                       const token = credential?.accessToken;
                                       if (!token) { throw new Error('Could not retrieve Drive Access Token.'); }
              if (token) {`;

const block1Replacement = `            const token = null;

            if (true) {
              if (true) {`;

// Because there are two identical ones, let's just do split and join
content = content.split(block1Pattern).join(block1Replacement);

const block4Pattern = `                                     const driveResult = await linkGoogleDrive();
                                     if (driveResult) {
                                         const credential = GoogleAuthProvider.credentialFromResult(driveResult);
                                         const token = credential?.accessToken;
                                         if (!token) throw new Error("No token");`;

const block4Replacement = `                                     const token = null;
                                     if (true) {`;

content = content.split(block4Pattern).join(block4Replacement);

const block5Pattern = `                                    const driveResult = await linkGoogleDrive();
                                    if (driveResult) {
                                       const credential = GoogleAuthProvider.credentialFromResult(driveResult);
                                       const token = credential?.accessToken;
                                       if (!token) { throw new Error('Could not retrieve Drive Access Token.'); }
                                       if (!token) throw new Error("Could not retrieve Drive Access Token.");`;

const block5Replacement = `                                    const token = null;
                                    if (true) {`;

content = content.split(block5Pattern).join(block5Replacement);

const block6Pattern = `                                                 const driveResult = await linkGoogleDrive();
                                                 if (driveResult) {
                                                   const credential = GoogleAuthProvider.credentialFromResult(driveResult);
                                                   const token = credential?.accessToken;
                                                   if (!token) return;`;

const block6Replacement = `                                                 const token = null;
                                                 if (true) {`;

content = content.split(block6Pattern).join(block6Replacement);

fs.writeFileSync('src/App.tsx', content);
console.log("App.tsx transformed successfully!");
