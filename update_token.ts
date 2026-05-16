import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add GoogleAuthProvider import
content = content.replace(
  "import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';",
  "import { onAuthStateChanged, User as FirebaseUser, GoogleAuthProvider } from 'firebase/auth';"
);

// Replace bad token extraction logic
const replaceTokenLogic = (text: string) => {
    return text.replace(
        /const token = \(driveResult as any\)\._tokenResponse\?\.oauthAccessToken \|\| \(await driveResult\.user\.getIdToken\(\)\);/g,
        "const credential = GoogleAuthProvider.credentialFromResult(driveResult);\n                                       const token = credential?.accessToken;\n                                       if (!token) { throw new Error('Could not retrieve Drive Access Token.'); }"
    );
};

content = replaceTokenLogic(content);

// For the other places (lines ~808 and ~2498 which are not quite identical maybe)
// Let me just replace `const token = (driveResult as any)._tokenResponse?.oauthAccessToken || (await driveResult.user.getIdToken());` everywhere
const targetStr = "const token = (driveResult as any)._tokenResponse?.oauthAccessToken || (await driveResult.user.getIdToken());";
const replaceStr = "const credential = GoogleAuthProvider.credentialFromResult(driveResult); const token = credential?.accessToken;";
content = content.split(targetStr).join(replaceStr);


// Now about moving the google drive tab.
// Currently it's in integrations. The user says "do you think it's worthwhile to put the Google drive stuff in its own category or tab under config?"
// Let's add 'storage' or 'drive' to the configSection types and move the Drive logic there.

fs.writeFileSync('src/App.tsx', content, 'utf8');
