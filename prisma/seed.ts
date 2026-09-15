import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Slugs Movimax no longer carries — removed here instead of just deleted
// from the arrays below, so a DB seeded before this change gets cleaned up
// too, not just one seeded fresh.
const RETIRED_PRODUCT_SLUGS = [
  "casco-seguridad-luz-led",
  "set-rodilleras-coderas",
  "chaleco-reflectante-movimax",
  "cargador-universal-patin-electrico",
  "camara-repuesto-rin-8-5",
  "candado-plegable-antirrobo",
];
const RETIRED_CATEGORY_SLUGS = ["cascos-y-seguridad", "repuestos-y-accesorios"];

async function main() {
  // Products first — a category can't be deleted while products still
  // reference it.
  await prisma.product.deleteMany({ where: { slug: { in: RETIRED_PRODUCT_SLUGS } } });
  await prisma.category.deleteMany({ where: { slug: { in: RETIRED_CATEGORY_SLUGS } } });

  // "Celulares" stays in-schema but empty: phones are only sold in the
  // physical stores for now, not through this catalog.
  const celulares = await prisma.category.upsert({
    where: { slug: "celulares" },
    update: {},
    create: { name: "Celulares", slug: "celulares", comingSoon: true },
  });

  // "Impermeabilizantes" is pending — data comes later. Kept in the schema
  // now so adding it later is just a seed update, not a migration.
  const impermeabilizantes = await prisma.category.upsert({
    where: { slug: "impermeabilizantes" },
    update: {},
    create: {
      name: "Impermeabilizantes",
      slug: "impermeabilizantes",
      comingSoon: true,
    },
  });

  const patines = await prisma.category.upsert({
    where: { slug: "patines-electricos" },
    update: {},
    create: { name: "Patines eléctricos", slug: "patines-electricos" },
  });

  const bicicletas = await prisma.category.upsert({
    where: { slug: "bicicletas-electricas" },
    update: {},
    create: { name: "Bicicletas eléctricas", slug: "bicicletas-electricas" },
  });

  const products = [
    {
      name: "Patín eléctrico Movimax X1",
      slug: "patin-electrico-movimax-x1",
      description:
        "Patín eléctrico plegable con motor de 350W, ideal para trayectos urbanos cortos. Incluye luces integradas y freno de disco.",
      spec: "Autonomía 25 km · hasta 25 km/h · plegable",
      priceCents: 499900,
      stock: 8,
      categoryId: patines.id,
    },
    {
      name: "Patín eléctrico Movimax X1 Pro",
      slug: "patin-electrico-movimax-x1-pro",
      description:
        "Versión Pro con batería de mayor capacidad y suspensión doble para calles irregulares.",
      spec: "Autonomía 40 km · hasta 32 km/h · suspensión doble",
      priceCents: 749900,
      stock: 5,
      categoryId: patines.id,
    },
    {
      name: "Bicicleta eléctrica Movimax Urban",
      slug: "bicicleta-electrica-movimax-urban",
      description:
        "Bicicleta eléctrica con motor de buje trasero de 250W y batería removible, pensada para ciudad.",
      spec: "Autonomía 50 km · motor 250W · batería removible",
      priceCents: 1299900,
      stock: 4,
      categoryId: bicicletas.id,
    },
    {
      name: "Bicicleta eléctrica Movimax Plegable",
      slug: "bicicleta-electrica-movimax-plegable",
      description:
        "Bicicleta eléctrica plegable, fácil de guardar en el clóset o cajuela del auto.",
      spec: "Autonomía 35 km · rines 16\" · plegable en 10s",
      priceCents: 1099900,
      stock: 6,
      categoryId: bicicletas.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  console.log(
    `Seed listo: ${products.length} productos en ${[patines, bicicletas].length} categorías activas. "${celulares.name}" e "${impermeabilizantes.name}" quedaron marcadas como próximamente.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
