import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError as handleError, OperationType } from '../lib/utils';

const PLATFORM_USERS_COLLECTION = 'platformUsers';

export interface PlatformUser {
  id: string;
  email: string;
  role: 'VIEWER' | 'EDITOR' | 'ADMIN' | 'OWNER';
  status: 'INVITED' | 'ACTIVE';
  createdAt: string;
}

export async function getPlatformUsers(): Promise<PlatformUser[]> {
  try {
    const q = query(collection(db, PLATFORM_USERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlatformUser));
  } catch (error) {
    handleError(error, OperationType.LIST, PLATFORM_USERS_COLLECTION);
    return [];
  }
}

export async function createPlatformUser(user: Omit<PlatformUser, 'id'>) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  const ref = doc(collection(db, PLATFORM_USERS_COLLECTION));
  try {
    await setDoc(ref, {
      ...user,
      id: ref.id
    });
    return ref.id;
  } catch (error) {
    handleError(error, OperationType.CREATE, PLATFORM_USERS_COLLECTION);
  }
}

export async function updatePlatformUser(id: string, updates: Partial<PlatformUser>) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  try {
    await updateDoc(doc(db, PLATFORM_USERS_COLLECTION, id), updates);
  } catch (error) {
    handleError(error, OperationType.UPDATE, PLATFORM_USERS_COLLECTION);
  }
}

export async function deletePlatformUser(id: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');
  
  try {
    await deleteDoc(doc(db, PLATFORM_USERS_COLLECTION, id));
  } catch (error) {
    handleError(error, OperationType.DELETE, PLATFORM_USERS_COLLECTION);
  }
}
