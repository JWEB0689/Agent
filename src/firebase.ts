import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

// Error handling interface from SKILL.md
export interface FirestoreErrorInfo {
  code: string;
  message: string;
  details?: any;
  resolution?: string;
  retryable: boolean;
}

export function handleFirestoreError(error: any): never {
  const info: FirestoreErrorInfo = {
    code: error.code || 'unknown',
    message: error.message || 'An unknown error occurred',
    retryable: false,
  };

  if (error.code === 'permission-denied') {
    info.resolution = 'Verify you are signed in and have access to this resource.';
  } else if (error.code === 'unavailable') {
    info.resolution = 'Check your internet connection. Firestore is currently offline.';
    info.retryable = true;
  } else if (error.code === 'unauthenticated') {
    info.resolution = 'Please sign in to continue.';
  } else if (error.code === 'quota-exceeded') {
    info.resolution = 'Database limit reached. Please try again later.';
  }

  throw new Error(JSON.stringify(info));
}

// Ensure the config file exists locally
import config from '../firebase-applet-config.json';

const firebaseConfig = {
  projectId: config.projectId,
  appId: config.appId,
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  // The SDK expects these exact keys, but config might have firestoreDatabaseId which is not standard in initialization
  // Standard initialization uses normal keys
  ...(config.storageBucket && { storageBucket: config.storageBucket }),
  ...(config.messagingSenderId && { messagingSenderId: config.messagingSenderId }),
  ...(config.measurementId && { measurementId: config.measurementId })
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence');
  }
});

const provider = new GoogleAuthProvider();

export const signIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    if ((error as any).code !== 'auth/popup-closed-by-user') {
      console.error('Sign-in error:', error);
    }
    throw error;
  }
};

export const signOut = () => firebaseSignOut(auth);
