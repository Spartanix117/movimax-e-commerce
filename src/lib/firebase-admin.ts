import { initializeApp, getApps, getApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cached: Firestore | null = null;

function loadServiceAccount(): ServiceAccount {
  // Preferred: the whole service-account JSON, base64-encoded into one
  // env var. No newlines, no quoting — nothing for a text editor or a
  // copy-paste to mangle, unlike pasting the private key's PEM block with
  // its escaped "\n" sequences directly (error-prone in practice).
  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (base64) {
    try {
      const json = Buffer.from(base64, "base64").toString("utf-8");
      const parsed = JSON.parse(json) as {
        project_id?: string;
        client_email?: string;
        private_key?: string;
      };
      if (parsed.project_id && parsed.client_email && parsed.private_key) {
        return {
          projectId: parsed.project_id,
          clientEmail: parsed.client_email,
          privateKey: parsed.private_key,
        };
      }
    } catch {
      // fall through to the three-separate-vars form below
    }
  }

  // Fallback: three separate env vars, for setups that already have them.
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Private keys pasted into a .env file often have their real newlines
  // flattened into the literal two-character sequence "\n" — turn those
  // back into actual newlines before handing the key to Firebase.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Faltan credenciales de Firebase Admin en .env — agrega FIREBASE_SERVICE_ACCOUNT_BASE64 " +
        "(recomendado) o FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY (ver README)."
    );
  }

  return { projectId, clientEmail, privateKey };
}

// Read the credentials lazily (inside the function, not at module load) so
// that routes/pages which never touch Firestore don't take the whole build
// down — Next.js evaluates API route modules while collecting build
// metadata, before any request ever calls the handler, so a top-level throw
// here would fail `next build` itself.
export function getAdminDb(): Firestore {
  if (cached) return cached;

  const serviceAccount = loadServiceAccount();
  const adminApp = getApps().length ? getApp() : initializeApp({ credential: cert(serviceAccount) });

  cached = getFirestore(adminApp);
  return cached;
}
