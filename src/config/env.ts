import { isFirebaseConfigured, firebaseConfig } from '../lib/firebase';

export interface EnvConfig {
  projectId: string;
  isConfigured: boolean;
}

export const env: EnvConfig = {
  projectId: firebaseConfig.projectId,
  isConfigured: isFirebaseConfigured,
};
