import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError as handleError, OperationType } from '../lib/utils';

const TEMPLATES_COLLECTION = 'templates';
const MANIFEST_TASKS_COLLECTION = 'manifestTasks';

export interface TemplateVersion {
  version: number;
  uploadDate: string;
  description: string;
}

export interface TemplateArtifact {
  id: string;
  name: string;
  description: string;
  fileType: string;
  uploadDate: string;
  currentVersion: number;
  versions: TemplateVersion[];
  usedIn: string[];
  isDeleted?: boolean;
  mimeType?: string;
  webViewLink?: string;
  iconLink?: string;
  driveId?: string;
  parentId?: string;
  isFolder?: boolean;
}

export interface ManifestTask {
  id: string;
  intent: string;
  tasks: string[];
  platformTasks: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  uploadDate: string;
  sourceFile: string;
}

export function subscribeTemplates(callback: (templates: TemplateArtifact[]) => void, options?: { includeDeleted?: boolean }) {
  const q = query(collection(db, TEMPLATES_COLLECTION), orderBy('uploadDate', 'desc'));
  return onSnapshot(q, (snapshot) => {
    let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TemplateArtifact));
    if (!options?.includeDeleted) {
      docs = docs.filter(doc => !doc.isDeleted);
    }
    callback(docs);
  }, (error) => {
    handleError(error, OperationType.LIST, TEMPLATES_COLLECTION);
  });
}

export async function getTemplates(options?: { includeDeleted?: boolean }): Promise<TemplateArtifact[]> {
  try {
    const q = query(collection(db, TEMPLATES_COLLECTION), orderBy('uploadDate', 'desc'));
    const snapshot = await getDocs(q);
    let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TemplateArtifact));
    if (!options?.includeDeleted) {
      docs = docs.filter(doc => !doc.isDeleted);
    }
    return docs;
  } catch (error) {
    handleError(error, OperationType.LIST, TEMPLATES_COLLECTION);
    return [];
  }
}

export async function createTemplate(template: Omit<TemplateArtifact, 'id'>) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  const ref = doc(collection(db, TEMPLATES_COLLECTION));
  try {
    await setDoc(ref, {
      ...template,
      id: ref.id
    });
    return ref.id;
  } catch (error) {
    handleError(error, OperationType.CREATE, TEMPLATES_COLLECTION);
  }
}

export async function updateTemplate(id: string, updates: Partial<TemplateArtifact>) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  try {
    await updateDoc(doc(db, TEMPLATES_COLLECTION, id), updates);
  } catch (error) {
    handleError(error, OperationType.UPDATE, TEMPLATES_COLLECTION);
  }
}

export async function deleteTemplate(id: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');
  
  try {
    await updateDoc(doc(db, TEMPLATES_COLLECTION, id), { isDeleted: true });
  } catch (error) {
    handleError(error, OperationType.DELETE, TEMPLATES_COLLECTION);
  }
}

export async function createManifestTasksRecord(record: Omit<ManifestTask, 'id'>) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');
  
  const ref = doc(collection(db, MANIFEST_TASKS_COLLECTION));
  try {
    await setDoc(ref, {
      ...record,
      id: ref.id
    });
    return ref.id;
  } catch (error) {
    handleError(error, OperationType.CREATE, MANIFEST_TASKS_COLLECTION);
  }
}

export async function getManifestTasks(): Promise<ManifestTask[]> {
  try {
    const q = query(collection(db, MANIFEST_TASKS_COLLECTION), orderBy('uploadDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ManifestTask));
  } catch (error) {
    handleError(error, OperationType.LIST, MANIFEST_TASKS_COLLECTION);
    return [];
  }
}
