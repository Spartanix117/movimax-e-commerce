import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cached: Firestore | null = null;

// Read the credentials lazily (inside the function, not at module load) so
// that routes/pages which never touch Firestore don't take the whole build
// down — Next.js evaluates API route modules while collecting build
// metadata, before any request ever calls the handler, so a top-level throw
// here would fail `next build` itself.
export function getAdminDb(): Firestore {
  if (cached) return cached;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Private keys pasted into a .env file or a dashboard often have their
  // real newlines flattened into the literal two-character sequence "\n" —
  // turn those back into actual newlines before handing the key to Firebase.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Faltan credenciales de Firebase Admin en .env — agrega FIREBASE_PROJECT_ID, " +
        "FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY (ver README)."
    );
  }

  const adminApp = getApps().length
    ? getApp()
    : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });

  cached = getFirestore(adminApp);
  return cached;
}
