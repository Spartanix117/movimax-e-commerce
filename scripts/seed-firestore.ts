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
];
const RETIRED_CATEGORY_SLUGS = ["cascos-y-seguridad", "repuestos-y-accesorios"];

const categories = [
  { slug: "celulares", name: "Celulares", comingSoon: true },
  { slug: "impermeabilizantes", name: "Impermeabilizantes", comingSoon: true },
  { slug: "patines-electricos", name: "Patines eléctricos" },
  { slug: "bicicletas-electricas", name: "Bicicletas eléctricas" },
];

const products = [
  { slug: "patin-electrico-movimax-x1", name: "Patín eléctrico Movimax X1", description: "Patín eléctrico plegable con motor de 350W, ideal para trayectos urbanos cortos. Incluye luces integradas y freno de disco.", spec: "Autonomía 25 km · hasta 25 km/h · plegable", priceCents: 499900, stock: 8, categoryId: "patines-electricos", isActive: true },
  { slug: "patin-electrico-movimax-x1-pro", name: "Patín eléctrico Movimax X1 Pro", description: "Versión Pro con batería de mayor capacidad y suspensión doble para calles irregulares.", spec: "Autonomía 40 km · hasta 32 km/h · suspensión doble", priceCents: 749900, stock: 5, categoryId: "patines-electricos", isActive: true },
  { slug: "bicicleta-electrica-movimax-urban", name: "Bicicleta eléctrica Movimax Urban", description: "Bicicleta eléctrica con motor de buje trasero de 250W y batería removible, pensada para ciudad.", spec: "Autonomía 50 km · motor 250W · batería removible", priceCents: 1299900, stock: 4, categoryId: "bicicletas-electricas", isActive: true },
  { slug: "bicicleta-electrica-movimax-plegable", name: "Bicicleta eléctrica Movimax Plegable", description: "Bicicleta eléctrica plegable, fácil de guardar en el clóset o cajuela del auto.", spec: "Autonomía 35 km · rines 16\" · plegable en 10s", priceCents: 1099900, stock: 6, categoryId: "bicicletas-electricas", isActive: true },
];

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

  const prodBatch = adminDb.batch();
  for (const product of products) {
    prodBatch.set(adminDb.collection("products").doc(product.slug), product);
  }
  await prodBatch.commit();

  console.log(`Seed listo: ${products.length} productos en ${categories.length} categorías.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
