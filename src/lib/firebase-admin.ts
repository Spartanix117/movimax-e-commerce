import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import serviceAccount from "../secrets/movimax-firebase-adminsdk-fbsvc-59b33bf990.json";

const adminApp = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert(serviceAccount as any),
    });

export const adminDb = getFirestore(adminApp);