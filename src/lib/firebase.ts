import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const driveAuthProvider = new GoogleAuthProvider();
driveAuthProvider.addScope('https://www.googleapis.com/auth/drive.file');
driveAuthProvider.addScope('https://www.googleapis.com/auth/drive.readonly');

// Validate Connection to Firestore (Critical Constraint)
import { doc, getDocFromCache, getDocFromServer } from 'firebase/firestore';
async function testConnection() {
  try {
    // Attempt to fetch a dummy doc to verify connection
    await getDocFromServer(doc(db, '_connection_test', 'status'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration: client is offline.");
    }
  }
}
testConnection();

export const loginWithGoogle = async () => {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error: any) {
    if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
      return null;
    }
    throw error;
  }
};

export const linkGoogleDrive = async () => {
  try {
    return await signInWithPopup(auth, driveAuthProvider);
  } catch (error: any) {
    throw error;
  }
};
export const logout = () => signOut(auth);
