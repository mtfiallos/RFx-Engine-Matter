import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError as handleError, OperationType } from '../lib/utils';

const PLATFORM_INTEGRATIONS_COLLECTION = 'platformIntegrations';

export interface PlatformIntegration {
  id: string;
  type: 'WEBHOOK' | 'SERVICE' | 'API_KEY' | 'GOOGLE_DRIVE' | 'RAG_SOURCE' | 'PERSONA' | 'EMAIL_INBOUND';
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  config: Record<string, any>;
  createdAt: string;
  lastUsed?: string;
}

export async function getPlatformIntegrations(): Promise<PlatformIntegration[]> {
  try {
    const q = query(collection(db, PLATFORM_INTEGRATIONS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlatformIntegration));
  } catch (error) {
    handleError(error, OperationType.LIST, PLATFORM_INTEGRATIONS_COLLECTION);
    return [];
  }
}

export async function createPlatformIntegration(integration: Omit<PlatformIntegration, 'id'>) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  const ref = doc(collection(db, PLATFORM_INTEGRATIONS_COLLECTION));
  try {
    await setDoc(ref, {
      ...integration,
      id: ref.id
    });
    return ref.id;
  } catch (error) {
    handleError(error, OperationType.CREATE, PLATFORM_INTEGRATIONS_COLLECTION);
  }
}

export async function updatePlatformIntegration(id: string, updates: Partial<PlatformIntegration>) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  try {
    await updateDoc(doc(db, PLATFORM_INTEGRATIONS_COLLECTION, id), updates);
  } catch (error) {
    handleError(error, OperationType.UPDATE, PLATFORM_INTEGRATIONS_COLLECTION);
  }
}

export async function deletePlatformIntegration(id: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');
  
  try {
    await deleteDoc(doc(db, PLATFORM_INTEGRATIONS_COLLECTION, id));
  } catch (error) {
    handleError(error, OperationType.DELETE, PLATFORM_INTEGRATIONS_COLLECTION);
  }
}
