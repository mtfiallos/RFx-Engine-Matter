import { 
  collection, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  doc, 
  getDoc,
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  writeBatch,
  arrayUnion,
  or,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError as handleError, OperationType } from '../lib/utils';

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER' | 'OWNER';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: any;
}

export interface UserFeedback {
  userId: string;
  userName: string;
  rating: 'helpful' | 'not_helpful';
  comment?: string;
  timestamp: string;
}

export interface Assumption {
  id: string;
  source: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  status: 'open' | 'validated' | 'closed';
  aiInsight?: string;
  aiConfidenceScore?: number;
  hallucinationFlag?: boolean;
  feedback?: UserFeedback[];
  assignedTo?: string;
}

export interface Risk {
  id: string;
  title: string;
  mitigation: string;
  impact: 'low' | 'medium' | 'high';
  probability: 'low' | 'medium' | 'high';
  aiProbabilityScore?: number;
  aiImpactScore?: number;
  aiConfidenceScore?: number;
  hallucinationFlag?: boolean;
  feedback?: UserFeedback[];
  assignedTo?: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string; // Base64 content for preview/prototype
  uploadedAt: string;
  driveFileId?: string;
  url?: string;
  scansCompleted?: ('requirements' | 'risks' | 'assumptions')[];
  extraction?: {
    requirements: { text: string; type: 'overt' | 'implied' | 'inferred' | 'inter' | 'hidden' }[];
    clauses: string[];
    risks: string[];
    assumptions: string[];
  };
}

export interface Requirement {
  id: string;
  source: string;
  text: string;
  type: 'overt' | 'implied' | 'inferred' | 'inter' | 'hidden';
  status: 'pending' | 'addressed' | 'non_compliant';
  aiInsight?: string;
  aiConfidenceScore?: number;
  hallucinationFlag?: boolean;
  assignedTo?: string;
  diffStatus?: 'new' | 'modified' | 'deleted' | 'unchanged';
}

export interface RfxData {
  requirements?: Requirement[];
  assumptions: Assumption[];
  risks: Risk[];
  files: FileMetadata[];
  executiveSummary?: string;
  lifecycle?: {
    currentGemId: string;
    scoreDelta?: number;
    isPackageReady?: boolean;
    remediationActions?: string[];
    executiveSummary?: string;
    valuePropositions?: string[];
  };
}

export interface VersionEntry {
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
}

export interface TaskLog {
  message: string;
  timestamp: string;
}

export interface WorkflowTask {
  id?: string;
  submissionId: string;
  type: 'INTAKE' | 'REVIEW' | 'APPROVAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'AWAITING_APPROVAL' | 'AWAITING_REVIEW';
  progress: number;
  logs: TaskLog[];
  ownerId: string;
  approvalRequired?: boolean;
  approvedBy?: string;
  comments?: string;
  createdAt: any;
  updatedAt: any;
}

export interface RfxSubmission {
  id?: string;
  title: string;
  description: string;
  status: 'draft' | 'submitted';
  ownerId: string;
  createdAt: any;
  updatedAt: any;
  isPublic?: boolean;
  sharedWith?: string[];
  sharedRoles?: { [email: string]: 'VIEWER' | 'EDITOR' };
  authorizedUsers?: { [uid: string]: UserRole };
  activeEditors?: { [uid: string]: { email: string, currentStep: string, heartbeat: number } };
  versionHistory: VersionEntry[];
  data: RfxData;
  driveFolderId?: string;
}

const COLLECTION_NAME = 'submissions';
const TASKS_COLLECTION = 'tasks';
const USERS_COLLECTION = 'users';

export async function ensureUserProfile() {
  const user = auth.currentUser;
  if (!user) return null;

  const docRef = doc(db, USERS_COLLECTION, user.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    const profile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'Unknown User',
      role: 'OWNER', // Ensure first user gets OWNER access to all panels
      createdAt: serverTimestamp()
    };
    await setDoc(docRef, profile);
    return profile;
  }

  const data = docSnap.data() as UserProfile;
  if (data.email === 'recirc@gmail.com' && data.role !== 'OWNER') {
    data.role = 'OWNER';
    await updateDoc(docRef, { role: 'OWNER' });
  }

  return data;
}

export async function getUserProfile(uid: string) {
  try {
    const docSnap = await getDoc(doc(db, USERS_COLLECTION, uid));
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  } catch (error) {
    handleError(error, OperationType.GET, `${USERS_COLLECTION}/${uid}`);
    return null;
  }
}

export async function createWorkflowTask(submissionId: string, type: 'INTAKE' | 'REVIEW') {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  const path = TASKS_COLLECTION;
  try {
    const docRef = await addDoc(collection(db, path), {
      submissionId,
      type,
      status: 'PENDING',
      progress: 0,
      logs: [{ message: `Task ${type} initialized`, timestamp: new Date().toISOString() }],
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleError(error, OperationType.CREATE, path);
  }
}

export function onTasksSnapshot(submissionId: string, callback: (tasks: any[]) => void) {
  const userId = auth.currentUser?.uid;
  if (!userId) return () => {};

  const path = TASKS_COLLECTION;
  const q = query(
    collection(db, path),
    where('submissionId', '==', submissionId),
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, (error) => {
    handleError(error, OperationType.LIST, path);
  });
}

export async function getTasksForSubmission(submissionId: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) return [];

  const path = TASKS_COLLECTION;
  try {
    const q = query(
      collection(db, path),
      where('submissionId', '==', submissionId),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WorkflowTask[];
  } catch (error) {
    handleError(error, OperationType.LIST, path);
  }
}

export async function updateTaskStatus(taskId: string, updates: Partial<WorkflowTask>) {
  const path = `${TASKS_COLLECTION}/${taskId}`;
  try {
    const docRef = doc(db, TASKS_COLLECTION, taskId);
    const cleanedUpdates = cleanUndefined(updates);
    await updateDoc(docRef, {
      ...cleanedUpdates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleError(error, OperationType.UPDATE, path);
  }
}

export async function deleteWorkflowTask(taskId: string) {
  const path = `${TASKS_COLLECTION}/${taskId}`;
  try {
    const docRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(docRef);
  } catch(error) {
    handleError(error, OperationType.DELETE, path);
  }
}

export async function updateActiveEditor(submissionId: string, step: string) {
  const user = auth.currentUser;
  if (!user) return;
  const docRef = doc(db, COLLECTION_NAME, submissionId);
  try {
    await setDoc(docRef, {
      activeEditors: {
        [user.uid]: {
          email: user.email || 'Anonymous',
          currentStep: step,
          heartbeat: Date.now()
        }
      }
    }, { merge: true });
  } catch (err) {
    handleError(err, OperationType.UPDATE, COLLECTION_NAME);
  }
}

export async function clearActiveEditor(submissionId: string) {
  const user = auth.currentUser;
  if (!user) return;
  const docRef = doc(db, COLLECTION_NAME, submissionId);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const currentEditors = docSnap.data().activeEditors || {};
      if (currentEditors[user.uid]) {
        delete currentEditors[user.uid];
        await updateDoc(docRef, { activeEditors: currentEditors });
      }
    }
  } catch (err) {
    handleError(err, OperationType.UPDATE, COLLECTION_NAME);
  }
}

export async function createSubmission(title: string, description: string = '', driveFolderId?: string) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  const path = COLLECTION_NAME;
  try {
    const data: any = {
      title,
      description,
      status: 'draft',
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isPublic: false,
      sharedWith: [],
      authorizedUsers: {},
      versionHistory: [{
        timestamp: new Date().toISOString(),
        userId: userId,
        userName: auth.currentUser?.displayName || 'Unknown User',
        action: 'CREATED_SUBMISSION'
      }],
      data: { assumptions: [], risks: [], files: [] }
    };
    if (driveFolderId) {
      data.driveFolderId = driveFolderId;
    }
    const docRef = await addDoc(collection(db, path), data);
    return docRef.id;
  } catch (error) {
    handleError(error, OperationType.CREATE, path);
  }
}

export function onSubmissionSnapshot(id: string, callback: (submission: any | null) => void) {
  const path = `${COLLECTION_NAME}/${id}`;
  return onSnapshot(doc(db, COLLECTION_NAME, id), (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    handleError(error, OperationType.GET, path);
  });
}

export async function getSubmission(id: string) {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as RfxSubmission;
    }
    return null;
  } catch (error) {
    handleError(error, OperationType.GET, path);
  }
}

export function subscribeSubmissions(callback: (submissions: RfxSubmission[]) => void) {
  const userId = auth.currentUser?.uid;
  const userEmail = auth.currentUser?.email;
  if (!userId) return () => {};

  const q = query(
    collection(db, COLLECTION_NAME), 
    or(
      where('ownerId', '==', userId),
      where('sharedWith', 'array-contains', userEmail)
    ),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as RfxSubmission));
  }, (error) => {
    handleError(error, OperationType.LIST, COLLECTION_NAME);
  });
}

export function cleanUndefined(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined).filter(v => v !== undefined);
  }
  if (typeof obj === 'object') {
    // DO NOT touch Firebase FieldValue instances or Dates
    if (obj.constructor && obj.constructor.name && obj.constructor.name !== 'Object' && obj.constructor.name !== 'Array') {
      return obj;
    }
    const result: any = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] !== undefined) {
        result[key] = cleanUndefined(obj[key]);
      }
    }
    return result;
  }
  return obj;
}

export async function updateSubmission(id: string, updates: Partial<RfxSubmission>, actionName: string = 'UPDATED_DRAFT') {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('Not authenticated');

  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const cleanedUpdates = cleanUndefined(updates);
    await updateDoc(docRef, {
      ...cleanedUpdates,
      updatedAt: serverTimestamp(),
      versionHistory: arrayUnion({
        timestamp: new Date().toISOString(),
        userId: userId,
        userName: auth.currentUser?.displayName || 'Unknown User',
        action: actionName
      })
    });
  } catch (error) {
    handleError(error, OperationType.UPDATE, path);
  }
}


export async function submitPackage(id: string) {
  return updateSubmission(id, { status: 'submitted' }, 'SUBMITTED_PACKAGE');
}

export async function deleteSubmission(id: string) {
  const path = `${COLLECTION_NAME}/${id}`;
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleError(error, OperationType.DELETE, path);
  }
}

export async function bulkDeleteSubmissions(ids: string[]) {
  const batch = writeBatch(db);
  ids.forEach(id => {
    const docRef = doc(db, COLLECTION_NAME, id);
    batch.delete(docRef);
  });
  
  try {
    await batch.commit();
  } catch (error) {
    handleError(error, OperationType.WRITE, COLLECTION_NAME);
  }
}

export async function bulkSubmitPackages(ids: string[]) {
  const batch = writeBatch(db);
  const now = serverTimestamp();
  const userId = auth.currentUser?.uid;
  const userName = auth.currentUser?.displayName || 'Unknown User';
  const timestamp = new Date().toISOString();

  ids.forEach(id => {
    const docRef = doc(db, COLLECTION_NAME, id);
    batch.update(docRef, { 
      status: 'submitted',
      updatedAt: now,
      versionHistory: arrayUnion({
        timestamp,
        userId,
        userName,
        action: 'BULK_SUBMITTED'
      })
    });
  });
  
  try {
    await batch.commit();
  } catch (error) {
    handleError(error, OperationType.WRITE, COLLECTION_NAME);
  }
}
