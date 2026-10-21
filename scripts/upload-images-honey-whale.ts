// Corre esto con: npm run upload:imagenes
//
// Sube las fotos en scripts/assets/honeywhale/<slug>.png a Firebase Storage
// y guarda la URL resultante en el campo imageUrl del producto con ese
// mismo slug. Usa el mismo mecanismo de token de descarga que
// /api/admin/upload (no necesita reglas de Storage públicas), y update()
// en vez de set/merge — si el slug no existe truena en vez de crear un
// producto a medias.
//
// Este archivo se va reescribiendo con cada tanda de fotos nueva, igual
// que update-specs-honey-whale.ts — es seguro volver a correrlo.
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { getAdminDb, getAdminBucket } from "../src/lib/firebase-admin";

const adminDb = getAdminDb();
const bucket = getAdminBucket();

const ASSETS_DIR = path.join(__dirname, "assets", "honeywhale");

// slug del producto -> nombre del archivo dentro de ASSETS_DIR
const rows: { slug: string; file: string }[] = [
  { slug: "patin-s2", file: "patin-s2.png" },
  { slug: "patin-s2max", file: "patin-s2max.png" },
  { slug: "patin-m1", file: "patin-m1.png" },
  { slug: "patin-m1-max", file: "patin-m1-max.png" },
  { slug: "patin-m1-elite", file: "patin-m1-elite.png" },
  { slug: "patin-e9pro-m2", file: "patin-e9pro-m2.png" },
  { slug: "patin-e9max-n", file: "patin-e9max-n.png" },
  { slug: "patin-s5", file: "patin-s5.png" },
  { slug: "patin-m4", file: "patin-m4.png" },
  { slug: "patin-c1pro", file: "patin-c1pro.png" },
  { slug: "patin-t1", file: "patin-t1.png" },
  { slug: "patin-h10", file: "patin-h10.png" },
  { slug: "patin-m5pro", file: "patin-m5pro.png" },
  { slug: "patin-t4a", file: "patin-t4a.png" },
  { slug: "patin-h3", file: "patin-h3.png" },
  { slug: "patin-t4d", file: "patin-t4d.png" },
  { slug: "patin-t4bn", file: "patin-t4bn.png" },
  { slug: "patin-t5", file: "patin-t5.png" },
  { slug: "patin-t8a", file: "patin-t8a.png" },
  { slug: "patin-t8max", file: "patin-t8max.png" },
  { slug: "patin-h2", file: "patin-h2.png" },
  { slug: "patin-h2d", file: "patin-h2d.png" },
  { slug: "patin-h4", file: "patin-h4.png" },
  { slug: "patin-discover", file: "patin-discover.png" },
];

async function main() {
  let updated = 0;
  let missing = 0;

  for (const row of rows) {
    const filePath = path.join(ASSETS_DIR, row.file);
    const buffer = readFileSync(filePath);
    const objectPath = `productos/${row.slug}.png`;
    const downloadToken = randomUUID();

    await bucket.file(objectPath).save(buffer, {
      contentType: "image/png",
      metadata: { metadata: { firebaseStorageDownloadTokens: downloadToken } },
    });

    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
      objectPath
    )}?alt=media&token=${downloadToken}`;

    try {
      await adminDb.collection("products").doc(row.slug).update({ imageUrl: url });
      updated++;
    } catch (err) {
      if ((err as { code?: number }).code === 5) {
        console.warn(`  ⚠ No existe un producto con slug "${row.slug}" — se subió la imagen pero no se vinculó.`);
        missing++;
        continue;
      }
      throw err;
    }
  }

  console.log(`Fotos vinculadas: ${updated} productos, ${missing} slugs no encontrados.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
