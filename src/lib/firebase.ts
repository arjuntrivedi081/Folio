import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import configJson from '../../firebase-applet-config.json';

const rawConfig: Record<string, string> = (configJson as unknown as Record<string, string>) || {};

export const firebaseConfig = {
  apiKey:
    rawConfig.apiKey ||
    import.meta.env.VITE_FIREBASE_API_KEY ||
    'AIzaSyDG7QjjAVFPW_BJ32ss6qbM4DoghgSae1k',
  authDomain:
    rawConfig.authDomain ||
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    'flutter-ai-playground-d14fa.firebaseapp.com',
  databaseURL:
    rawConfig.databaseURL ||
    'https://flutter-ai-playground-d14fa-default-rtdb.firebaseio.com',
  projectId:
    rawConfig.projectId ||
    import.meta.env.VITE_FIREBASE_PROJECT_ID ||
    'flutter-ai-playground-d14fa',
  storageBucket:
    rawConfig.storageBucket ||
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    'flutter-ai-playground-d14fa.firebasestorage.app',
  messagingSenderId:
    rawConfig.messagingSenderId ||
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    '346223246811',
  appId:
    rawConfig.appId ||
    import.meta.env.VITE_FIREBASE_APP_ID ||
    '1:346223246811:web:9a43e917fde3e308cf7bfe',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let appInstance: FirebaseApp;
if (!getApps().length) {
  appInstance = initializeApp(firebaseConfig);
} else {
  appInstance = getApp();
}

export const app: FirebaseApp = appInstance;

// Initialize Firestore with persistent multi-tab local caching
const databaseId = rawConfig.firestoreDatabaseId?.trim();

export const db: Firestore = databaseId
  ? initializeFirestore(
      app,
      {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      },
      databaseId
    )
  : initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });

export const storage: FirebaseStorage = getStorage(
  app,
  `gs://${firebaseConfig.storageBucket}`
);

// Standard error formatting helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  throw new Error(errInfo.error);
}
