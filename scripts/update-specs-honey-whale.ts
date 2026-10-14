// Corre esto con: npm run update:specs
//
// Agrega spec/description a productos que ya existen (creados por
// import-honey-whale-precios.ts) usando las fichas técnicas reales del
// catálogo Honey Whale. Solo toca spec/description — nunca precio, stock,
// nombre, categoría ni imageUrl, y usa update() (no set/merge), así que si
// el slug no existe truena con un error claro en vez de crear un producto
// a medias sin precio ni categoría.
//
// Este archivo se va a ir reescribiendo con cada tanda nueva de specs que
// llegue del catálogo — es seguro volver a correrlo, los productos ya
// actualizados simplemente se vuelven a escribir con los mismos datos.
import { getAdminDb } from "../src/lib/firebase-admin";

const adminDb = getAdminDb();

type Row = { slug: string; spec: string; description: string };

const rows: Row[] = [
  {
    slug: "patin-s2",
    spec: "Motor 350-500W, hasta 25 km/h, autonomía 18-20 km, batería 36V/6.6Ah",
    description: "Equipo ligero y divertido con luces en la base\n\nSoporte: 120 KG · Llantas: 8.5 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-s2max",
    spec: "Motor 350-500W, hasta 32 km/h, autonomía 22 km, batería 36V/7.8Ah",
    description: "Equipo ligero y compacto, con un plus de amortiguación\n\nSoporte: 120 KG · Llantas: 10 Pulg · Material: Metal",
  },
  {
    slug: "patin-m1",
    spec: "Motor 350-500W, hasta 25 km/h, autonomía 15 km, batería 36V/5.2Ah",
    description: "Un equipo eléctrico que no te pesa con su diseño ultraligero\n\nSoporte: 120 KG · Llantas: 8.5 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-m1-max",
    spec: "Motor 350-500W, hasta 32 km/h, autonomía 22 km, batería 36V/7.8Ah",
    description: "El compañero perfecto para tus trayectos\n\nSoporte: 120 KG · Llantas: 10 Pulg · Material: Metal",
  },
  {
    slug: "patin-m1-elite",
    spec: "Motor 400-500W, hasta 25 km/h, autonomía 16 km, batería 36V/5.2Ah",
    description: "Tan ligero que hasta un niño puede manejarlo y es plegable para caber en cualquier rincón de tu casa\n\nSoporte: 120 KG · Llantas: 8.5 Pulg · Material: Metal",
  },
  {
    slug: "bicicleta-s6pro-s",
    spec: "Motor 350-750W, hasta 35 km/h, autonomía 45 km, batería 48V/15Ah",
    description: "Olvídate del tráfico y del estrés: bici plegable con suspensión, perfecta para recorrer la ciudad sin perder comodidad\n\nSoporte: 120 KG · Llantas: 14 Pulg · Material: Metal",
  },
  {
    slug: "bicicleta-b20",
    spec: "Motor 350-440W, hasta 25 km/h, autonomía 35 km, batería 36V/7.8Ah",
    description: "Compacta pero potente: la B20 ofrece gran velocidad y autonomía sin que tu bolsillo sufra\n\nSoporte: 120 KG · Llantas: 14 Pulg · Material: Metal",
  },
  {
    slug: "moto-bicicleta-u1s",
    spec: "Motor 350-650W, hasta 31 km/h, autonomía 65 km, batería 48V/20Ah",
    description: "Motobici ligera y cómoda, ideal para cualquier viaje. Su diseño práctico te ofrece la libertad de moverte con facilidad.\n\nSoporte: 150 KG · Llantas: 14 Pulg · Material: Acero",
  },
  {
    slug: "moto-dm04",
    spec: "Motor 3000-3700W, 3 velocidades (40/60/80 km/h), autonomía hasta 100 km, batería 72V/38Ah",
    description:
      "La moto que estabas esperando, conoce la potencia que te brinda y disfruta de su doble asiento.\n\n" +
      "Velocidades: 40 km/h (hasta 100 km) · 60 km/h (hasta 75 km) · 80 km/h (hasta 60 km)\n" +
      "Soporte: 150 KG · Llantas: 110/70-12 Pulg · Material: Acero",
  },
  {
    // Confirmado: se queda en "Motos" (ya creado ahí como "Moto U3PRO"),
    // no se mueve a Moto bicicletas aunque el PDF del catálogo lo agrupe ahí.
    slug: "moto-u3pro",
    spec: "Motor 400-650W, hasta 45 km/h, autonomía 60 km, batería 48V/20Ah",
    description: "Motobici ligera y cómoda, ideal para cualquier viaje.\n\nSoporte: 150 KG · Llantas: D.8 T.14 Pulg · Material: Acero",
  },
];

async function main() {
  let updated = 0;
  let missing = 0;

  for (const row of rows) {
    try {
      await adminDb.collection("products").doc(row.slug).update({
        spec: row.spec,
        description: row.description,
      });
      updated++;
    } catch (err) {
      if ((err as { code?: number }).code === 5) {
        // gRPC NOT_FOUND — el slug no existe, no lo inventamos.
        console.warn(`  ⚠ No existe un producto con slug "${row.slug}" — se saltó.`);
        missing++;
        continue;
      }
      throw err;
    }
  }

  console.log(`Specs actualizadas: ${updated} productos, ${missing} slugs no encontrados.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
