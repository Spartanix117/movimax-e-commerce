// Corre esto con: npm run db:seed
import { getAdminDb } from "../src/lib/firebase-admin";

const adminDb = getAdminDb();

// Slugs Movimax no longer carries — deleted explicitly (not just left out
// of the arrays below) so a database seeded before this change gets
// cleaned up too, not just a freshly-seeded one. Doc ids equal slugs here.
const RETIRED_PRODUCT_SLUGS = [
  "casco-seguridad-luz-led",
  "set-rodilleras-coderas",
  "chaleco-reflectante-movimax",
  "cargador-universal-patin-electrico",
  "camara-repuesto-rin-8-5",
  "candado-plegable-antirrobo",
  // Productos de ejemplo usados mientras no había catálogo real — se
  // retiran al empezar a cargar modelos reales (p.ej. Honey Whale).
  "patin-electrico-movimax-x1",
  "patin-electrico-movimax-x1-pro",
  "bicicleta-electrica-movimax-urban",
  "bicicleta-electrica-movimax-plegable",
];
const RETIRED_CATEGORY_SLUGS = ["cascos-y-seguridad", "repuestos-y-accesorios"];

const categories = [
  { slug: "celulares", name: "Celulares", comingSoon: true },
  { slug: "impermeabilizantes", name: "Impermeabilizantes", comingSoon: true },
  { slug: "patines-electricos", name: "Patines eléctricos" },
  { slug: "bicicletas-electricas", name: "Bicicletas eléctricas" },
];

// Los productos reales se cargan desde /admin/productos — este seed ya
// solo mantiene las categorías y limpia los de ejemplo (arriba).

async function main() {
  const cleanupBatch = adminDb.batch();
  for (const slug of RETIRED_PRODUCT_SLUGS) {
    cleanupBatch.delete(adminDb.collection("products").doc(slug));
  }
  for (const slug of RETIRED_CATEGORY_SLUGS) {
    cleanupBatch.delete(adminDb.collection("categories").doc(slug));
  }
  await cleanupBatch.commit();

  const catBatch = adminDb.batch();
  for (const category of categories) {
    catBatch.set(adminDb.collection("categories").doc(category.slug), category);
  }
  await catBatch.commit();

  console.log(`Seed listo: ${categories.length} categorías (productos se administran en /admin/productos).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
