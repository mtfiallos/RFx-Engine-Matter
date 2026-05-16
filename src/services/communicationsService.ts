import { collection, doc, getDocs, setDoc, query, orderBy, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface InboundEmail {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  body?: string;
  date: string;
  status: 'unread' | 'read' | 'handled';
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function getInboundEmails(): Promise<InboundEmail[]> {
  try {
    const q = query(collection(db, 'inbound_emails'), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    
    // Seed dummy data if empty to show that it is functional
    if(snap.empty) {
      await seedEmails();
      return getInboundEmails();
    }
    
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as InboundEmail));
  } catch (error) {
    return handleFirestoreError(error, OperationType.LIST, 'inbound_emails') as any;
  }
}

async function seedEmails() {
   const dummy = [
        { from: 'vendor@example.com', subject: 'Re: Clarifications on RFP X-902', snippet: 'Can you provide the final architectural schematics for section 3.2?', body: 'Hello Elyria Team,\n\nWe are in the process of finalizing our technical response for RFP X-902. Can you provide the final architectural schematics for section 3.2 as discussed in the last SME call?\n\nBest Regards,\nVendor Technical Team', date: new Date().toISOString(), status: 'unread' as const },
        { from: 'legal@clientcorp.com', subject: 'Revised MSA Terms', snippet: 'Please review the attached changes to clause 4.5.1 regarding indemnification.', body: 'To the Pursuit Lead,\n\nPlease find the revised Master Service Agreement attached. Specifically, review the changes to clause 4.5.1 regarding indemnification limits. These were adjusted based on the feedback from your risk management team.\n\nLegal Counsel', date: new Date(Date.now() - 86400000).toISOString(), status: 'read' as const },
        { from: 'procurement@acme.inc', subject: 'Submission Received', snippet: 'We have received your proposal and it is currently under technical review.', body: 'Dear Proponent,\n\nThis is to confirm that we have received your proposal for the ACME Outsourcing Project. The submission is currently under technical review by our evaluators. You will be notified of the outcome or any clarification requests by the end of the week.\n\nAcme Procurement', date: new Date(Date.now() - 172800000).toISOString(), status: 'handled' as const },
   ];
   for(let mail of dummy) {
       await addInboundEmail(mail);
   }
}

export async function addInboundEmail(email: Omit<InboundEmail, 'id'>) {
  try {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    await setDoc(doc(db, 'inbound_emails', id), {
      ...email,
      id
    });
    return id;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, 'inbound_emails');
  }
}

export async function updateInboundEmailStatus(id: string, status: 'unread' | 'read' | 'handled') {
  try {
    await updateDoc(doc(db, 'inbound_emails', id), {
      status
    });
  } catch (error) {
    return handleFirestoreError(error, OperationType.UPDATE, `inbound_emails/${id}`);
  }
}

export async function deleteInboundEmail(id: string) {
  try {
    await deleteDoc(doc(db, 'inbound_emails', id));
  } catch (error) {
    return handleFirestoreError(error, OperationType.DELETE, `inbound_emails/${id}`);
  }
}
