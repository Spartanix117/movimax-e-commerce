// Corre esto con: npm run db:seed
import { adminDb } from "../src/lib/firebase-admin";

const categories = [
  { slug: "celulares", name: "Celulares", comingSoon: true },
  { slug: "impermeabilizantes", name: "Impermeabilizantes", comingSoon: true },
  { slug: "patines-electricos", name: "Patines eléctricos" },
  { slug: "bicicletas-electricas", name: "Bicicletas eléctricas" },
  { slug: "cascos-y-seguridad", name: "Cascos y seguridad" },
  { slug: "repuestos-y-accesorios", name: "Repuestos y accesorios" },
];

const products = [
  { slug: "patin-electrico-movimax-x1", name: "Patín eléctrico Movimax X1", description: "Patín eléctrico plegable con motor de 350W, ideal para trayectos urbanos cortos. Incluye luces integradas y freno de disco.", spec: "Autonomía 25 km · hasta 25 km/h · plegable", priceCents: 499900, stock: 8, categoryId: "patines-electricos", isActive: true },
  { slug: "patin-electrico-movimax-x1-pro", name: "Patín eléctrico Movimax X1 Pro", description: "Versión Pro con batería de mayor capacidad y suspensión doble para calles irregulares.", spec: "Autonomía 40 km · hasta 32 km/h · suspensión doble", priceCents: 749900, stock: 5, categoryId: "patines-electricos", isActive: true },
  { slug: "bicicleta-electrica-movimax-urban", name: "Bicicleta eléctrica Movimax Urban", description: "Bicicleta eléctrica con motor de buje trasero de 250W y batería removible, pensada para ciudad.", spec: "Autonomía 50 km · motor 250W · batería removible", priceCents: 1299900, stock: 4, categoryId: "bicicletas-electricas", isActive: true },
  { slug: "bicicleta-electrica-movimax-plegable", name: "Bicicleta eléctrica Movimax Plegable", description: "Bicicleta eléctrica plegable, fácil de guardar en el clóset o cajuela del auto.", spec: "Autonomía 35 km · rines 16\" · plegable en 10s", priceCents: 1099900, stock: 6, categoryId: "bicicletas-electricas", isActive: true },
  { slug: "casco-seguridad-luz-led", name: "Casco de seguridad con luz LED", description: "Casco certificado con luz trasera LED recargable para mayor visibilidad nocturna.", spec: "Certificado · ajuste regulable · luz LED recargable", priceCents: 45900, stock: 20, categoryId: "cascos-y-seguridad", isActive: true },
  { slug: "set-rodilleras-coderas", name: "Set de rodilleras y coderas", description: "Protección básica para trayectos en patín o bicicleta eléctrica, ajuste con velcro.", spec: "Talla ajustable · espuma de alta densidad", priceCents: 34900, stock: 15, categoryId: "cascos-y-seguridad", isActive: true },
  { slug: "chaleco-reflectante-movimax", name: "Chaleco reflectante Movimax", description: "Chaleco reflectante ligero para mayor visibilidad al circular de noche.", spec: "Talla única ajustable · alta reflectividad", priceCents: 15900, stock: 25, categoryId: "cascos-y-seguridad", isActive: true },
  { slug: "cargador-universal-patin-electrico", name: "Cargador universal para patín eléctrico", description: "Cargador de reemplazo compatible con la mayoría de patines eléctricos Movimax.", spec: "Entrada 100-240V · conector universal", priceCents: 39900, stock: 12, categoryId: "repuestos-y-accesorios", isActive: true },
  { slug: "camara-repuesto-rin-8-5", name: "Cámara de repuesto rin 8.5\"", description: "Cámara de aire de repuesto para patines eléctricos con rin de 8.5 pulgadas.", spec: "Rin 8.5\" · válvula recta", priceCents: 12900, stock: 30, categoryId: "repuestos-y-accesorios", isActive: true },
  { slug: "candado-plegable-antirrobo", name: "Candado plegable antirrobo", description: "Candado plegable de acero endurecido para asegurar tu patín o bicicleta eléctrica.", spec: "Acero endurecido · incluye soporte de montaje", priceCents: 29900, stock: 18, categoryId: "repuestos-y-accesorios", isActive: true },
];

async function main() {
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