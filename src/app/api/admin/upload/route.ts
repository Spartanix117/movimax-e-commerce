import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getAdminBucket } from "@/lib/firebase-admin";
import { isAuthorized } from "@/lib/admin-auth";

const MAX_BYTES = 5 * 1024 * 1024;

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_API_KEY) {
    return NextResponse.json({ error: "ADMIN_API_KEY no está configurada." }, { status: 500 });
  }
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  let bucket;
  try {
    bucket = getAdminBucket();
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "No se pudo leer el archivo." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  }

  const extension = EXTENSION_BY_MIME[file.type];
  if (!extension) {
    return NextResponse.json({ error: "Solo se aceptan imágenes JPG, PNG o WEBP." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen no debe pesar más de 5 MB." }, { status: 400 });
  }

  const objectPath = `productos/${randomUUID()}.${extension}`;
  // Firebase Storage's default rules can require auth to read — a download
  // token (the same mechanism the client SDK's getDownloadURL() relies on)
  // grants public read on this one object regardless of those rules, so the
  // catalog can show it without opening up the whole bucket or depending on
  // bucket-level ACLs (which uniform bucket-level access would reject).
  const downloadToken = randomUUID();

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    await bucket.file(objectPath).save(buffer, {
      contentType: file.type,
      metadata: { metadata: { firebaseStorageDownloadTokens: downloadToken } },
    });
  } catch {
    return NextResponse.json({ error: "No se pudo subir la imagen a Firebase Storage." }, { status: 500 });
  }

  const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
    objectPath
  )}?alt=media&token=${downloadToken}`;

  return NextResponse.json({ url });
}
