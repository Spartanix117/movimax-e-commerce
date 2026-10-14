// Corre esto con: npm run import:precios
//
// Carga masiva del catálogo Honey Whale a partir de la lista de precios
// (Honey_Whale_-_Precios.pdf). Solo trae categoría/modelo/precio — spec y
// description quedan en blanco hasta procesar el PDF con las fichas
// técnicas completas, y stock arranca en DEFAULT_STOCK porque ninguno de
// estos modelos está en la tienda física todavía (se piden sobre demanda).
//
// BK05 se excluye a propósito: ya está cargado a mano desde /admin/productos
// con specs y foto reales, y no queremos pisarlo. Por la misma razón, cada
// producto se crea con .create() (falla si el slug ya existe) en vez de
// .set() — así una segunda corrida nunca sobreescribe algo que ya editaste
// a mano en el panel.
import { getAdminDb } from "../src/lib/firebase-admin";

const adminDb = getAdminDb();

const DEFAULT_STOCK = 5;

const CATEGORY_MAP = {
  BICIS: { categoryId: "bicicletas-electricas", prefix: "Bicicleta" },
  SCOOTERS: { categoryId: "patines-electricos", prefix: "Patín" },
  INFANTILES: { categoryId: "infantiles", prefix: "Vehículo infantil" },
  "MOTO BICI": { categoryId: "moto-bici", prefix: "Moto bicicleta" },
  MOTOS: { categoryId: "motos", prefix: "Moto" },
  TRIMOTOS: { categoryId: "trimotos", prefix: "Trimoto" },
} as const;

type ExcelCategory = keyof typeof CATEGORY_MAP;

// Categorías nuevas que esta lista necesita y el sitio todavía no tiene.
// "bicicletas-electricas" y "patines-electricos" ya existen — no se tocan.
const NEW_CATEGORIES = [
  { slug: "infantiles", name: "Vehículos infantiles" },
  { slug: "moto-bici", name: "Moto bicicletas" },
  { slug: "motos", name: "Motos eléctricas" },
  { slug: "trimotos", name: "Trimotos eléctricas" },
];

// [categoría del Excel, modelo, precio en pesos (sin centavos)]
const rows: [ExcelCategory, string, number][] = [
  // BICIS (sin BK05, ya cargado a mano)
  ["BICIS", "B20", 8700],
  ["BICIS", "S3", 9630],
  ["BICIS", "S4", 10650],
  ["BICIS", "S6PRO-S", 10705],
  ["BICIS", "S8", 14700],
  ["BICIS", "BW02", 14370],
  ["BICIS", "F6", 14499],
  ["BICIS", "F6S", 14949],
  ["BICIS", "F6PRO-S", 15950],
  ["BICIS", "K6", 18279],
  ["BICIS", "S10", 19789],
  ["BICIS", "S9PRO", 19789],
  ["BICIS", "S13", 22799],
  ["BICIS", "K7", 19800],
  ["BICIS", "K6PRO", 24000],
  ["BICIS", "BK08", 26900],

  // SCOOTERS
  ["SCOOTERS", "M1 ELITE", 5070],
  ["SCOOTERS", "F3", 5870],
  ["SCOOTERS", "F4", 6070],
  ["SCOOTERS", "M1", 6080],
  ["SCOOTERS", "S2", 6580],
  ["SCOOTERS", "E9PRO/M2", 6080],
  ["SCOOTERS", "E9T", 7599],
  ["SCOOTERS", "S5", 8099],
  ["SCOOTERS", "S2MAX", 8249],
  ["SCOOTERS", "M1 MAX", 8610],
  ["SCOOTERS", "E9MAXS", 10650],
  ["SCOOTERS", "E9MAX-N", 11150],
  ["SCOOTERS", "M4", 11660],
  ["SCOOTERS", "M5PRO", 11199],
  ["SCOOTERS", "T4A", 12669],
  ["SCOOTERS", "M5ELITE", 11999],
  ["SCOOTERS", "C1PRO", 14699],
  ["SCOOTERS", "T4B", 14799],
  ["SCOOTERS", "T1", 16200],
  ["SCOOTERS", "H2", 15400],
  ["SCOOTERS", "G2PRO", 16220],
  ["SCOOTERS", "G2", 16220],
  ["SCOOTERS", "H2D", 18340],
  ["SCOOTERS", "T4BN", 15999],
  ["SCOOTERS", "T8A", 16249],
  ["SCOOTERS", "T5", 17269],
  ["SCOOTERS", "H3", 17769],
  ["SCOOTERS", "G3PRO", 18220],
  ["SCOOTERS", "H10", 17479],
  ["SCOOTERS", "T8B", 20299],
  ["SCOOTERS", "T4D", 20800],
  ["SCOOTERS", "H4", 22000],
  ["SCOOTERS", "H2D ULTRA", 20439],
  ["SCOOTERS", "G4MAX", 22660],
  ["SCOOTERS", "T8MAX", 24399],
  ["SCOOTERS", "DISCOVER", 29900],
  ["SCOOTERS", "F8", 51900],

  // INFANTILES
  ["INFANTILES", "BDQ-S08", 2027],
  ["INFANTILES", "BDQ-9", 3050],
  ["INFANTILES", "BDQ-009", 3070],
  ["INFANTILES", "BDQ-6288", 3060],
  ["INFANTILES", "BDQ-6688", 3060],
  ["INFANTILES", "BDQ-916", 3270],
  ["INFANTILES", "E2", 3540],
  ["INFANTILES", "E8", 4040],
  ["INFANTILES", "BDQ-K1", 4040],
  ["INFANTILES", "MZ008", 3550],
  ["INFANTILES", "BDQ-018", 4040],
  ["INFANTILES", "BDQ-1208", 4570],
  ["INFANTILES", "MZ008B", 4100],
  ["INFANTILES", "MZ008C", 4100],
  ["INFANTILES", "BDQ-0818", 4599],
  ["INFANTILES", "E6", 3950],
  ["INFANTILES", "E11", 4550],
  ["INFANTILES", "E10S", 4550],
  ["INFANTILES", "MZ007A", 5110],
  ["INFANTILES", "MZ007B", 5110],
  ["INFANTILES", "BDQ-6388", 5100],
  ["INFANTILES", "JL-005", 5130],
  ["INFANTILES", "BDQ-1200", 5599],
  ["INFANTILES", "BDQ-8110", 6090],
  ["INFANTILES", "BDQ-008", 6099],
  ["INFANTILES", "BDQ-8", 6070],
  ["INFANTILES", "JL-006", 6140],
  ["INFANTILES", "BDQ-6988", 6070],
  ["INFANTILES", "BDQ-6088", 7699],
  ["INFANTILES", "J2", 6700],
  ["INFANTILES", "BDQ-1206", 7700],
  ["INFANTILES", "NM1", 8600],

  // MOTO BICI
  ["MOTO BICI", "U1S", 10710],
  ["MOTO BICI", "ST03", 13699],
  ["MOTO BICI", "YL-07", 14900],

  // MOTOS
  ["MOTOS", "U4S", 14700],
  ["MOTOS", "U3S", 14720],
  ["MOTOS", "U3PRO", 15850],
  ["MOTOS", "KC-COOL", 15799],
  ["MOTOS", "KCPRO", 17830],
  ["MOTOS", "UNA", 19469],
  ["MOTOS", "V3", 19269],
  ["MOTOS", "U8S", 20875],
  ["MOTOS", "V4", 20789],
  ["MOTOS", "V1", 22049],
  ["MOTOS", "U9s", 20820],
  ["MOTOS", "ZL", 20850],
  ["MOTOS", "U7S", 20999],
  ["MOTOS", "I009", 23869],
  ["MOTOS", "V5", 24450],
  ["MOTOS", "V11", 30150],
  ["MOTOS", "V15", 31300],
  ["MOTOS", "V6", 34220],
  ["MOTOS", "V16", 46750],
  ["MOTOS", "F160", 46149],
  ["MOTOS", "DM04", 31050],
  ["MOTOS", "DM06", 39099],
  ["MOTOS", "DM05", 40700],

  // TRIMOTOS
  ["TRIMOTOS", "HN-N7", 22850],
  ["TRIMOTOS", "HN-V1", 22850],
  ["TRIMOTOS", "HN-N8", 24899],
  ["TRIMOTOS", "HN-N1", 28000],
  ["TRIMOTOS", "HN-N2", 28970],
  ["TRIMOTOS", "HN-N5", 31020],
  ["TRIMOTOS", "SZ-110", 35070],
  ["TRIMOTOS", "HN-N9", 41199],
  ["TRIMOTOS", "HN-C80 PRO", 51370],
  ["TRIMOTOS", "H21", 51499],
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const catBatch = adminDb.batch();
  for (const category of NEW_CATEGORIES) {
    catBatch.set(adminDb.collection("categories").doc(category.slug), category, { merge: true });
  }
  await catBatch.commit();

  let created = 0;
  let skipped = 0;
  for (const [excelCategory, modelo, precio] of rows) {
    const { categoryId, prefix } = CATEGORY_MAP[excelCategory];
    const name = `${prefix} ${modelo}`;
    const slug = slugify(name);

    try {
      await adminDb
        .collection("products")
        .doc(slug)
        .create({
          name,
          slug,
          categoryId,
          priceCents: precio * 100,
          stock: DEFAULT_STOCK,
          spec: "",
          description: "",
          imageUrl: "",
          isActive: true,
        });
      created++;
    } catch (err) {
      if ((err as { code?: number }).code === 6) {
        // gRPC ALREADY_EXISTS — ya existe (lo agregaste a mano o se corrió
        // esto antes), no lo tocamos.
        skipped++;
        continue;
      }
      throw err;
    }
  }

  console.log(
    `Importación lista: ${created} productos creados, ${skipped} ya existían (sin tocar), ` +
      `${NEW_CATEGORIES.length} categorías nuevas. Falta spec/description y foto por producto.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
