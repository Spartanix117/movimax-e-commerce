import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
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

  const seguridad = await prisma.category.upsert({
    where: { slug: "cascos-y-seguridad" },
    update: {},
    create: { name: "Cascos y seguridad", slug: "cascos-y-seguridad" },
  });

  const repuestos = await prisma.category.upsert({
    where: { slug: "repuestos-y-accesorios" },
    update: {},
    create: { name: "Repuestos y accesorios", slug: "repuestos-y-accesorios" },
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
    {
      name: "Casco de seguridad con luz LED",
      slug: "casco-seguridad-luz-led",
      description:
        "Casco certificado con luz trasera LED recargable para mayor visibilidad nocturna.",
      spec: "Certificado · ajuste regulable · luz LED recargable",
      priceCents: 45900,
      stock: 20,
      categoryId: seguridad.id,
    },
    {
      name: "Set de rodilleras y coderas",
      slug: "set-rodilleras-coderas",
      description:
        "Protección básica para trayectos en patín o bicicleta eléctrica, ajuste con velcro.",
      spec: "Talla ajustable · espuma de alta densidad",
      priceCents: 34900,
      stock: 15,
      categoryId: seguridad.id,
    },
    {
      name: "Chaleco reflectante Movimax",
      slug: "chaleco-reflectante-movimax",
      description:
        "Chaleco reflectante ligero para mayor visibilidad al circular de noche.",
      spec: "Talla única ajustable · alta reflectividad",
      priceCents: 15900,
      stock: 25,
      categoryId: seguridad.id,
    },
    {
      name: "Cargador universal para patín eléctrico",
      slug: "cargador-universal-patin-electrico",
      description:
        "Cargador de reemplazo compatible con la mayoría de patines eléctricos Movimax.",
      spec: "Entrada 100-240V · conector universal",
      priceCents: 39900,
      stock: 12,
      categoryId: repuestos.id,
    },
    {
      name: "Cámara de repuesto rin 8.5\"",
      slug: "camara-repuesto-rin-8-5",
      description:
        "Cámara de aire de repuesto para patines eléctricos con rin de 8.5 pulgadas.",
      spec: "Rin 8.5\" · válvula recta",
      priceCents: 12900,
      stock: 30,
      categoryId: repuestos.id,
    },
    {
      name: "Candado plegable antirrobo",
      slug: "candado-plegable-antirrobo",
      description:
        "Candado plegable de acero endurecido para asegurar tu patín o bicicleta eléctrica.",
      spec: "Acero endurecido · incluye soporte de montaje",
      priceCents: 29900,
      stock: 18,
      categoryId: repuestos.id,
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
    `Seed listo: ${products.length} productos en ${[patines, bicicletas, seguridad, repuestos].length} categorías activas. "${celulares.name}" e "${impermeabilizantes.name}" quedaron marcadas como próximamente.`
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
