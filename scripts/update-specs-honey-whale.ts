// Corre esto con: npm run update:specs
//
// Agrega spec/description a productos que ya existen (creados por
// import-honey-whale-precios.ts) usando las fichas técnicas reales del
// catálogo Honey Whale (los 121 modelos con specs que mandó el cliente).
// Solo toca spec/description — nunca precio, stock, nombre, categoría ni
// imageUrl, y usa update() (no set/merge), así que si el slug no existe
// truena con un error claro en vez de crear un producto a medias sin
// precio ni categoría. BK05 está excluido a propósito: ya está cargado a
// mano con specs y foto reales, no se pisa.
//
// Este archivo se va a ir reescribiendo con cada tanda nueva de specs que
// llegue del catálogo — es seguro volver a correrlo, los productos ya
// actualizados simplemente se vuelven a escribir con los mismos datos.
import { getAdminDb } from "../src/lib/firebase-admin";

const adminDb = getAdminDb();

type Row = { slug: string; spec: string; description: string };

const rows: Row[] = [
  {
    slug: "bicicleta-b20",
    spec: "Motor 350-440W, hasta 25 km/h, autonomía 35 km, batería 36V/7.8Ah",
    description: "Compacta pero potente: la B20 ofrece gran velocidad y autonomía sin que tu bolsillo sufra\n\nSoporte: 120 KG · Llantas: 14 Pulg · Material: Metal",
  },
  {
    slug: "bicicleta-bk08",
    spec: "Motor 1000W, hasta 50 km/h, autonomía 70 km, batería 48V/20Ah",
    description: "Gama alta de MTB eléctrica con batería de 20AH de largo alcance\n\nSoporte: 150 KG · Llantas: 27.5 Pulg · Material: Aluminio Reforzado",
  },
  {
    slug: "bicicleta-bw02",
    spec: "Motor 500W, hasta 35 km/h, autonomía 40 km, batería 48V/10Ah",
    description: "Bicicleta eléctrica versátil para traslados diarios y urbanos\n\nSoporte: 125 KG · Llantas: 16 Pulg · Material: Acero",
  },
  {
    slug: "bicicleta-f6",
    spec: "Motor 500W, hasta 40 km/h, autonomía 45 km, batería 48V/12.5Ah",
    description: "Llantas anchas Fat Tire de 20 pulgadas para cualquier terreno\n\nSoporte: 130 KG · Llantas: 20 Pulg · Material: Aluminio",
  },
  {
    slug: "bicicleta-f6pro-s",
    spec: "Motor 750W, hasta 45 km/h, autonomía 50 km, batería 48V/15Ah",
    description: "Potencia aumentada para pendientes y terreno irregular\n\nSoporte: 140 KG · Llantas: 20 Pulg · Material: Aluminio",
  },
  {
    slug: "bicicleta-f6s",
    spec: "Motor 500W, hasta 40 km/h, autonomía 45 km, batería 48V/13Ah",
    description: "Versión mejorada de la F6 con amortiguador hidráulico\n\nSoporte: 130 KG · Llantas: 20 Pulg · Material: Aluminio",
  },
  {
    slug: "bicicleta-k6",
    spec: "Motor 500W, hasta 40 km/h, autonomía 50 km, batería 48V/13Ah",
    description: "Diseño tipo montaña con llantas de 26 pulgadas\n\nSoporte: 130 KG · Llantas: 26 Pulg · Material: Aluminio",
  },
  {
    slug: "bicicleta-k6pro",
    spec: "Motor 750W, hasta 48 km/h, autonomía 60 km, batería 48V/16Ah",
    description: "Motorización potente de 750W con transmisión hidráulica\n\nSoporte: 150 KG · Llantas: 26 Pulg · Material: Aluminio",
  },
  {
    slug: "bicicleta-k7",
    spec: "Motor 500W, hasta 45 km/h, autonomía 50 km, batería 48V/13Ah",
    description: "Rodada 27.5 todoterreno para caminos difíciles de montaña\n\nSoporte: 140 KG · Llantas: 27.5 Pulg · Material: Aluminio",
  },
  {
    slug: "bicicleta-s10",
    spec: "Motor 500W, hasta 40 km/h, autonomía 55 km, batería 48V/15Ah",
    description: "Marco aerodinámico plegable con cambios Shimano de 7 velocidades\n\nSoporte: 130 KG · Llantas: 20 Pulg · Material: Aluminio",
  },
  {
    slug: "bicicleta-s13",
    spec: "Motor 750W, hasta 45 km/h, autonomía 60 km, batería 48V/18Ah",
    description: "Doble suspensión con batería extraíble de gran capacidad\n\nSoporte: 150 KG · Llantas: 20 Pulg · Material: Aluminio",
  },
  {
    slug: "bicicleta-s3",
    spec: "Motor 350W, hasta 30 km/h, autonomía 35 km, batería 36V/8Ah",
    description: "Bicicleta urbana compacta plegable fácil de transportar\n\nSoporte: 120 KG · Llantas: 14 Pulg · Material: Metal",
  },
  {
    slug: "bicicleta-s4",
    spec: "Motor 350W, hasta 32 km/h, autonomía 38 km, batería 48V/10Ah",
    description: "Mayor rango de batería con suspensión central mejorada\n\nSoporte: 120 KG · Llantas: 14 Pulg · Material: Metal",
  },
  {
    slug: "bicicleta-s6pro-s",
    spec: "Motor 350-750W, hasta 35 km/h, autonomía 45 km, batería 48V/15Ah",
    description: "Olvídate del tráfico y del estrés: bici plegable con suspensión, perfecta para recorrer la ciudad sin perder comodidad\n\nSoporte: 120 KG · Llantas: 14 Pulg · Material: Metal",
  },
  {
    slug: "bicicleta-s8",
    spec: "Motor 500W, hasta 35 km/h, autonomía 45 km, batería 48V/13Ah",
    description: "Diseño plegable robusto con batería integrada al marco\n\nSoporte: 130 KG · Llantas: 16 Pulg · Material: Aluminio",
  },
  {
    slug: "bicicleta-s9pro",
    spec: "Motor 750W, hasta 42 km/h, autonomía 55 km, batería 48V/15Ah",
    description: "Bicicleta eléctrica de alto rendimiento y autonomía superior\n\nSoporte: 140 KG · Llantas: 20 Pulg · Material: Aluminio",
  },
  {
    slug: "moto-bicicleta-st03",
    spec: "Motor 500W, hasta 35 km/h, autonomía 55 km, batería 48V/20Ah",
    description: "Excelente rendimiento con diseño clásico y pedales de apoyo\n\nSoporte: 150 KG · Llantas: 14 Pulg · Material: Acero",
  },
  {
    slug: "moto-bicicleta-u1s",
    spec: "Motor 350-650W, hasta 31 km/h, autonomía 65 km, batería 48V/20Ah",
    description: "Motobici ligera y cómoda, ideal para cualquier viaje. Su diseño práctico te ofrece la libertad de moverte con facilidad.\n\nSoporte: 150 KG · Llantas: 14 Pulg · Material: Acero",
  },
  {
    slug: "moto-bicicleta-yl-07",
    spec: "Motor 600W, hasta 38 km/h, autonomía 60 km, batería 48V/20Ah",
    description: "Chasis reforzado con amortiguador hidráulico doble y gran asiento\n\nSoporte: 150 KG · Llantas: 14 Pulg · Material: Acero",
  },
  {
    slug: "moto-dm04",
    spec: "Motor 3000-3700W, 3 velocidades (40/60/80 km/h), autonomía hasta 100 km, batería 72V/38Ah",
    description: "La moto que estabas esperando, conoce la potencia que te brinda y disfruta de su doble asiento.\n\nVelocidades: 40 km/h (hasta 100 km) · 60 km/h (hasta 75 km) · 80 km/h (hasta 60 km)\nSoporte: 150 KG · Llantas: 110/70-12 Pulg · Material: Acero",
  },
  {
    slug: "moto-dm05",
    spec: "Motor 4000W, hasta 90 km/h, autonomía 100 km, batería 72V/45Ah",
    description: "Súper deportiva eléctrica con frenos de disco hidráulicos dobles\n\nSoporte: 180 KG · Llantas: 12 Pulg · Material: Acero Reforzado",
  },
  {
    slug: "moto-dm06",
    spec: "Motor 3500W, hasta 85 km/h, autonomía 95 km, batería 72V/40Ah",
    description: "Estilo naked deportivo con gran torque de aceleración\n\nSoporte: 180 KG · Llantas: 12 Pulg · Material: Acero Reforzado",
  },
  {
    slug: "moto-f160",
    spec: "Motor 4500W, hasta 95 km/h, autonomía 100 km, batería 72V/50Ah",
    description: "Motocicleta tipo pistera urbana de alto cilindraje eléctrico\n\nSoporte: 200 KG · Llantas: 13 Pulg · Material: Aleación de Acero",
  },
  {
    slug: "moto-i009",
    spec: "Motor 1500W, hasta 55 km/h, autonomía 70 km, batería 72V/20Ah",
    description: "Diseño ejecutivo con baúl de equipaje y espacio amplio\n\nSoporte: 170 KG · Llantas: 10 Pulg · Material: Acero",
  },
  {
    slug: "moto-kc-cool",
    spec: "Motor 600W, hasta 42 km/h, autonomía 55 km, batería 48V/20Ah",
    description: "Estilo moderno y juvenil con pantalla digital inteligente\n\nSoporte: 150 KG · Llantas: 14 Pulg · Material: Acero",
  },
  {
    slug: "moto-kcpro",
    spec: "Motor 800W, hasta 45 km/h, autonomía 60 km, batería 60V/20Ah",
    description: "Versión pro con mayor potencia de arranque y sistema de alarma\n\nSoporte: 150 KG · Llantas: 14 Pulg · Material: Acero",
  },
  {
    slug: "moto-u3pro",
    spec: "Motor 400-650W, hasta 45 km/h, autonomía 60 km, batería 48V/20Ah",
    description: "Motobici ligera y cómoda, ideal para cualquier viaje.\n\nSoporte: 150 KG · Llantas: D.8 T.14 Pulg · Material: Acero",
  },
  {
    slug: "moto-u3s",
    spec: "Motor 600W, hasta 40 km/h, autonomía 55 km, batería 48V/20Ah",
    description: "Diseño ergonómico con canastilla delantera y respaldo trasero\n\nSoporte: 150 KG · Llantas: 14 Pulg · Material: Acero",
  },
  {
    slug: "moto-u4s",
    spec: "Motor 600W, hasta 40 km/h, autonomía 55 km, batería 48V/20Ah",
    description: "Moped compacto urbano para un usuario\n\nSoporte: 150 KG · Llantas: 14 Pulg · Material: Acero",
  },
  {
    slug: "moto-u7s",
    spec: "Motor 1200W, hasta 52 km/h, autonomía 65 km, batería 60V/20Ah",
    description: "Moto urbana eficiente con amortiguación trasera reforzada\n\nSoporte: 160 KG · Llantas: 10 Pulg · Material: Acero",
  },
  {
    slug: "moto-u8s",
    spec: "Motor 1000W, hasta 50 km/h, autonomía 65 km, batería 60V/20Ah",
    description: "Rendimiento óptimo con caja de transporte adaptable\n\nSoporte: 160 KG · Llantas: 10 Pulg · Material: Acero",
  },
  {
    slug: "moto-u9s",
    spec: "Motor 1000W, hasta 50 km/h, autonomía 65 km, batería 60V/20Ah",
    description: "Chasis largo para mayor comodidad en distancias medias\n\nSoporte: 160 KG · Llantas: 10 Pulg · Material: Acero",
  },
  {
    slug: "moto-una",
    spec: "Motor 1000W, hasta 50 km/h, autonomía 65 km, batería 60V/20Ah",
    description: "Diseño elegante tipo vespa urbana eléctrica\n\nSoporte: 160 KG · Llantas: 10 Pulg · Material: Acero",
  },
  {
    slug: "moto-v1",
    spec: "Motor 1500W, hasta 55 km/h, autonomía 70 km, batería 72V/20Ah",
    description: "Potencia de 1500W con bateria de 72V de respuesta inmediata\n\nSoporte: 170 KG · Llantas: 10 Pulg · Material: Acero",
  },
  {
    slug: "moto-v11",
    spec: "Motor 2000W, hasta 65 km/h, autonomía 80 km, batería 72V/32Ah",
    description: "Motocicleta eléctrica tipo scooter de gran potencia\n\nSoporte: 180 KG · Llantas: 12 Pulg · Material: Acero",
  },
  {
    slug: "moto-v15",
    spec: "Motor 2500W, hasta 70 km/h, autonomía 85 km, batería 72V/32Ah",
    description: "Moped maxi scooter de alta velocidad con frenos ABS mecánicos\n\nSoporte: 180 KG · Llantas: 12 Pulg · Material: Acero",
  },
  {
    slug: "moto-v16",
    spec: "Motor 5000W, hasta 100 km/h, autonomía 110 km, batería 72V/52Ah",
    description: "La máxima expresión en scooters eléctricos de largo alcance\n\nSoporte: 200 KG · Llantas: 13 Pulg · Material: Aleación de Acero",
  },
  {
    slug: "moto-v3",
    spec: "Motor 1000W, hasta 50 km/h, autonomía 60 km, batería 60V/20Ah",
    description: "Scooter eléctrico amplio para dos pasajeros cómodos\n\nSoporte: 160 KG · Llantas: 10 Pulg · Material: Acero",
  },
  {
    slug: "moto-v4",
    spec: "Motor 1200W, hasta 52 km/h, autonomía 65 km, batería 60V/20Ah",
    description: "Frenos de disco combinados y excelente capacidad de aceleración\n\nSoporte: 160 KG · Llantas: 10 Pulg · Material: Acero",
  },
  {
    slug: "moto-v5",
    spec: "Motor 1500W, hasta 60 km/h, autonomía 75 km, batería 72V/20Ah",
    description: "Suspensión de alto confort y sistema de alarma antirrobo\n\nSoporte: 170 KG · Llantas: 12 Pulg · Material: Acero",
  },
  {
    slug: "moto-v6",
    spec: "Motor 3000W, hasta 75 km/h, autonomía 90 km, batería 72V/35Ah",
    description: "Diseño maxi scooter confort con respaldo alto para acompañante\n\nSoporte: 180 KG · Llantas: 12 Pulg · Material: Acero",
  },
  {
    slug: "moto-zl",
    spec: "Motor 1200W, hasta 52 km/h, autonomía 65 km, batería 60V/20Ah",
    description: "Líneas deportivas y faro frontal de alta penetración LED\n\nSoporte: 160 KG · Llantas: 10 Pulg · Material: Acero",
  },
  {
    slug: "patin-c1pro",
    spec: "Motor 500W, hasta 45 km/h, autonomía 40 km, batería 48V/13Ah",
    description: "Estilo scooter tipo sentado con canastilla trasera útil para carga\n\nSoporte: 140 KG · Llantas: 12 Pulg · Material: Acero",
  },
  {
    slug: "patin-discover",
    spec: "Motor 2x1500W, hasta 70 km/h, autonomía 70 km, batería 60V/28Ah",
    description: "Diseño vanguardista con potencia de grado profesional y máxima suspensión\n\nSoporte: 160 KG · Llantas: 11 Pulg · Material: Aleación de Aluminio",
  },
  {
    slug: "patin-e9max-n",
    spec: "Motor 500W, hasta 35 km/h, autonomía 32 km, batería 36V/10.4Ah",
    description: "Versión actualizada con sistema de frenado optimizado\n\nSoporte: 120 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-e9maxs",
    spec: "Motor 500W, hasta 35 km/h, autonomía 30 km, batería 36V/10Ah",
    description: "Autonomía extendida con amortiguador traseros y delanteros\n\nSoporte: 120 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    // Corregido con la ficha real del catálogo (p. 11): "MODELO M2 PRO / e9 pro"
    // — el JSON traía valores ligeramente distintos (30 km/h, 7.5Ah).
    slug: "patin-e9pro-m2",
    spec: "Motor 350-500W, hasta 32 km/h, autonomía 22 km, batería 36V/7.8Ah",
    description: "Ideal para trayectos cortos en la ciudad, ligero, fácil de transportar y disponible en varios colores.\n\nSoporte: 120 KG · Llantas: 8.5 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-e9t",
    spec: "Motor 350W, hasta 30 km/h, autonomía 25 km, batería 36V/7.8Ah",
    description: "Estructura reforzada ideal para el uso constante en trayectos mixtos\n\nSoporte: 120 KG · Llantas: 10 Pulg · Material: Metal",
  },
  {
    slug: "patin-f3",
    spec: "Motor 350W, hasta 25 km/h, autonomía 18 km, batería 36V/6Ah",
    description: "Diseño ágil y dinámico para traslados diarios en la ciudad\n\nSoporte: 120 KG · Llantas: 8.5 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-f4",
    spec: "Motor 350W, hasta 28 km/h, autonomía 20 km, batería 36V/7.5Ah",
    description: "Plegado rápido con excelente balance entre autonomía y peso\n\nSoporte: 120 KG · Llantas: 8.5 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-f8",
    spec: "Motor 2x2000W, hasta 85 km/h, autonomía 85 km, batería 72V/35Ah",
    description: "El scooter más potente de la gama con aceleración de competición\n\nSoporte: 180 KG · Llantas: 11 Pulg · Material: Titanio y Aluminio",
  },
  {
    slug: "patin-g2",
    spec: "Motor 800W, hasta 45 km/h, autonomía 45 km, batería 48V/15Ah",
    description: "Diseño deportivo y aerodinámico con frenos de disco dobles\n\nSoporte: 150 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-g2pro",
    spec: "Motor 800W, hasta 45 km/h, autonomía 45 km, batería 48V/15Ah",
    description: "Potencia todoterreno con chasis deportivo de alto impacto\n\nSoporte: 150 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-g3pro",
    spec: "Motor 2x1000W, hasta 55 km/h, autonomía 55 km, batería 52V/18Ah",
    description: "Doble motor hiperpotente para rutas todo terreno y velocidad pura\n\nSoporte: 150 KG · Llantas: 10 Pulg · Material: Aluminio Reforzado",
  },
  {
    slug: "patin-g4max",
    spec: "Motor 2x1200W, hasta 65 km/h, autonomía 60 km, batería 60V/20Ah",
    description: "Estructura reforzada, llantas tubeless de 11 pulgadas e hidráulicos\n\nSoporte: 150 KG · Llantas: 11 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-h10",
    spec: "Motor 1000W, hasta 50 km/h, autonomía 50 km, batería 48V/18Ah",
    description: "Chasis extendido con máxima capacidad de respuesta hidráulica\n\nSoporte: 150 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-h2",
    spec: "Motor 800W, hasta 45 km/h, autonomía 40 km, batería 48V/13Ah",
    description: "Suspensión de alto desempeño y neumáticos todoterreno\n\nSoporte: 140 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-h2d",
    spec: "Motor 2x800W, hasta 50 km/h, autonomía 45 km, batería 48V/18Ah",
    description: "Motor dual para la máxima potencia en aceleración y pendientes\n\nSoporte: 150 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-h2d-ultra",
    spec: "Motor 2x1000W, hasta 60 km/h, autonomía 55 km, batería 52V/20Ah",
    description: "Versión extrema con mayor capacidad de aceleración y respuesta frenado\n\nSoporte: 150 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-h3",
    spec: "Motor 1000W, hasta 50 km/h, autonomía 50 km, batería 48V/18Ah",
    description: "Scooter de gama alta con iluminación surround y pantalla LCD inteligente\n\nSoporte: 150 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-h4",
    spec: "Motor 1200W, hasta 60 km/h, autonomía 60 km, batería 52V/20Ah",
    description: "Potencia avanzada con batería de largo alcance para viajes interurbanos\n\nSoporte: 150 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-m1",
    spec: "Motor 350-500W, hasta 25 km/h, autonomía 15 km, batería 36V/5.2Ah",
    description: "Un equipo eléctrico que no te pesa con su diseño ultraligero\n\nSoporte: 120 KG · Llantas: 8.5 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-m1-elite",
    spec: "Motor 400-500W, hasta 25 km/h, autonomía 16 km, batería 36V/5.2Ah",
    description: "Tan ligero que hasta un niño puede manejarlo y es plegable para caber en cualquier rincón de tu casa\n\nSoporte: 120 KG · Llantas: 8.5 Pulg · Material: Metal",
  },
  {
    slug: "patin-m1-max",
    spec: "Motor 350-500W, hasta 32 km/h, autonomía 22 km, batería 36V/7.8Ah",
    description: "El compañero perfecto para tus trayectos con batería de mayor capacidad\n\nSoporte: 120 KG · Llantas: 10 Pulg · Material: Metal",
  },
  {
    slug: "patin-m4",
    spec: "Motor 500-800W, hasta 40 km/h, autonomía 35 km, batería 48V/10Ah",
    description: "Chasis robusto con manubrio ajustable y luz frontal potente\n\nSoporte: 130 KG · Llantas: 10 Pulg · Material: Aleación de Aluminio",
  },
  {
    slug: "patin-m5elite",
    spec: "Motor 600W, hasta 42 km/h, autonomía 38 km, batería 48V/13Ah",
    description: "Acabados premium con cuadro reforzado y máxima estabilidad\n\nSoporte: 130 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-m5pro",
    spec: "Motor 500W, hasta 40 km/h, autonomía 35 km, batería 48V/11Ah",
    description: "Incluye asiento desmontable para un trayecto más cómodo\n\nSoporte: 130 KG · Llantas: 10 Pulg · Material: Metal",
  },
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
    slug: "patin-s5",
    spec: "Motor 500W, hasta 32 km/h, autonomía 25 km, batería 36V/8.8Ah",
    description: "Potencia adicional para superar pendientes urbanas con mayor soltura\n\nSoporte: 120 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-t1",
    spec: "Motor 800W, hasta 45 km/h, autonomía 45 km, batería 48V/15Ah",
    description: "Modelo urbano robusto con excelente estabilidad a alta velocidad\n\nSoporte: 140 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-t4a",
    spec: "Motor 600W, hasta 40 km/h, autonomía 35 km, batería 48V/12.5Ah",
    description: "Diseño todoterreno inicial con doble suspensión\n\nSoporte: 130 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-t4b",
    spec: "Motor 800W, hasta 45 km/h, autonomía 40 km, batería 48V/13Ah",
    description: "Motor con tracción optimizada para pendientes pronunciadas\n\nSoporte: 140 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-t4bn",
    spec: "Motor 800W, hasta 45 km/h, autonomía 42 km, batería 48V/14Ah",
    description: "Edición especial con batería optimizada de mayor densidad\n\nSoporte: 140 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-t4d",
    spec: "Motor 2x1000W, hasta 55 km/h, autonomía 50 km, batería 52V/18Ah",
    description: "Doble motor dinámico con opción de tracción sencilla o doble\n\nSoporte: 150 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-t5",
    spec: "Motor 1000W, hasta 50 km/h, autonomía 50 km, batería 48V/18Ah",
    description: "Excelente suspensión de doble resorte para máxima absorción de impactos\n\nSoporte: 150 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-t8a",
    spec: "Motor 800W, hasta 48 km/h, autonomía 45 km, batería 48V/15Ah",
    description: "Estructura pesada de gran estabilidad para tramos largos\n\nSoporte: 150 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-t8b",
    spec: "Motor 1200W, hasta 55 km/h, autonomía 55 km, batería 52V/20Ah",
    description: "Motorización superior para usuarios que requieren gran torque\n\nSoporte: 150 KG · Llantas: 10 Pulg · Material: Aluminio",
  },
  {
    slug: "patin-t8max",
    spec: "Motor 2x1200W, hasta 65 km/h, autonomía 65 km, batería 60V/24Ah",
    description: "Autonomía sobresaliente para trayectos largos sin recarga intermedia\n\nSoporte: 150 KG · Llantas: 11 Pulg · Material: Aluminio",
  },
  {
    slug: "trimoto-h21",
    spec: "Motor 2200W, hasta 50 km/h, autonomía 80 km, batería 72V/52Ah",
    description: "Motocarro eléctrico de carga pesada con cabina cerrada para conductor\n\nSoporte: 650 KG · Llantas: 12 Pulg Heavy Duty · Material: Acero Industrial",
  },
  {
    slug: "trimoto-hn-c80-pro",
    spec: "Motor 2000W, hasta 45 km/h, autonomía 75 km, batería 72V/50Ah",
    description: "Carguero eléctrico de alta capacidad con sistema volcador hidráulico\n\nSoporte: 600 KG · Llantas: 12 Pulg Heavy Duty · Material: Acero Industrial",
  },
  {
    slug: "trimoto-hn-n1",
    spec: "Motor 800W, hasta 38 km/h, autonomía 55 km, batería 60V/20Ah",
    description: "Trimoto familiar con capacidad para 3 personas cómodamente\n\nSoporte: 250 KG · Llantas: 10 Pulg · Material: Acero Reforzado",
  },
  {
    slug: "trimoto-hn-n2",
    spec: "Motor 800W, hasta 38 km/h, autonomía 60 km, batería 60V/20Ah",
    description: "Chasis extendido con compartimiento de carga cerrado\n\nSoporte: 250 KG · Llantas: 10 Pulg · Material: Acero Reforzado",
  },
  {
    slug: "trimoto-hn-n5",
    spec: "Motor 1000W, hasta 40 km/h, autonomía 60 km, batería 60V/32Ah",
    description: "Trimoto para carga ligera con batea abatible\n\nSoporte: 300 KG · Llantas: 12 Pulg · Material: Acero Reforzado",
  },
  {
    slug: "trimoto-hn-n7",
    spec: "Motor 600W, hasta 35 km/h, autonomía 50 km, batería 48V/20Ah",
    description: "Trimoto pasajeros estable para movilidad urbana accesible\n\nSoporte: 200 KG · Llantas: 10 Pulg · Material: Acero",
  },
  {
    slug: "trimoto-hn-n8",
    spec: "Motor 800W, hasta 35 km/h, autonomía 55 km, batería 60V/20Ah",
    description: "Diseño confort con respaldo reclinable para adultos mayores o carga\n\nSoporte: 220 KG · Llantas: 10 Pulg · Material: Acero",
  },
  {
    slug: "trimoto-hn-n9",
    spec: "Motor 1500W, hasta 45 km/h, autonomía 70 km, batería 72V/45Ah",
    description: "Trimoto cerrada con cabina de protección contra lluvia y clima\n\nSoporte: 350 KG · Llantas: 12 Pulg · Material: Acero y Fibra de Vidrio",
  },
  {
    slug: "trimoto-hn-v1",
    spec: "Motor 600W, hasta 35 km/h, autonomía 50 km, batería 48V/20Ah",
    description: "Trimoto de tres ruedas con doble asiento y cesta de carga\n\nSoporte: 200 KG · Llantas: 10 Pulg · Material: Acero",
  },
  {
    slug: "trimoto-sz-110",
    spec: "Motor 1200W, hasta 40 km/h, autonomía 65 km, batería 60V/32Ah",
    description: "Trimoto de carga pesada uso rudo comercial\n\nSoporte: 400 KG · Llantas: 12 Pulg · Material: Estructura de Acero Heavy Duty",
  },
  {
    slug: "vehiculo-infantil-bdq-008",
    spec: "Motor 4x55W, hasta 12 km/h, autonomía 18 km, batería 24V/7Ah",
    description: "Auto montable premium con acabados de pintura automotriz\n\nSoporte: 60 KG · Llantas: 11 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-009",
    spec: "Motor 45W, hasta 6 km/h, autonomía 10 km, batería 12V/4.5Ah",
    description: "Minimoto infantil de tres ruedas para mayor estabilidad\n\nSoporte: 35 KG · Llantas: 7 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-018",
    spec: "Motor 2x45W, hasta 8 km/h, autonomía 12 km, batería 12V/7Ah",
    description: "Coche montable de dos plazas con reproducción de música MP3\n\nSoporte: 45 KG · Llantas: 8 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-0818",
    spec: "Motor 4x35W, hasta 8 km/h, autonomía 15 km, batería 12V/10Ah",
    description: "Coche infantil con suspensión en las 4 ruedas\n\nSoporte: 50 KG · Llantas: 10 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-1200",
    spec: "Motor 4x45W, hasta 10 km/h, autonomía 18 km, batería 12V/12Ah",
    description: "Camioneta eléctrica de 2 plazas con puertas abatibles\n\nSoporte: 55 KG · Llantas: 11 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-1206",
    spec: "Motor 4x90W, hasta 12 km/h, autonomía 20 km, batería 24V/10Ah",
    description: "UTV gigante para niños con asiento de piel sintética\n\nSoporte: 70 KG · Llantas: 12 Pulg · Material: Plástico ABS / Metal",
  },
  {
    slug: "vehiculo-infantil-bdq-1208",
    spec: "Motor 4x35W, hasta 8 km/h, autonomía 15 km, batería 12V/10Ah",
    description: "Montable 4x4 estilo Jeep con control remoto para padres\n\nSoporte: 50 KG · Llantas: 10 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-6088",
    spec: "Motor 4x90W, hasta 12 km/h, autonomía 20 km, batería 24V/10Ah",
    description: "Camioneta 4x4 de gran tamaño con amortiguadores reforzados\n\nSoporte: 70 KG · Llantas: 12 Pulg · Material: Plástico ABS / Metal",
  },
  {
    slug: "vehiculo-infantil-bdq-6288",
    spec: "Motor 45W, hasta 6 km/h, autonomía 10 km, batería 12V/4.5Ah",
    description: "Vehículo montable con luces LED delanteras y control remoto\n\nSoporte: 35 KG · Llantas: 7 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-6388",
    spec: "Motor 4x45W, hasta 9 km/h, autonomía 15 km, batería 12V/10Ah",
    description: "Montable tipo camioneta con amortiguadores y luces traseras\n\nSoporte: 50 KG · Llantas: 10 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-6688",
    spec: "Motor 45W, hasta 6 km/h, autonomía 10 km, batería 12V/4.5Ah",
    description: "Montable eléctrico estilo aventura para niños\n\nSoporte: 35 KG · Llantas: 7 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-6988",
    spec: "Motor 2x55W, hasta 10 km/h, autonomía 18 km, batería 12V/12Ah",
    description: "Montable estilo tractor con remolque desmontable\n\nSoporte: 60 KG · Llantas: 11 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-8",
    spec: "Motor 4x45W, hasta 10 km/h, autonomía 18 km, batería 12V/12Ah",
    description: "Coche infantil deportivo con aceleración suave y cinturón de seguridad\n\nSoporte: 60 KG · Llantas: 11 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-8110",
    spec: "Motor 4x55W, hasta 12 km/h, autonomía 18 km, batería 24V/7Ah",
    description: "Buggy de playa para niños con tracción integral\n\nSoporte: 60 KG · Llantas: 11 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-9",
    spec: "Motor 45W, hasta 6 km/h, autonomía 10 km, batería 12V/4.5Ah",
    description: "Cuatrimoto infantil con diseño deportivo y sonidos\n\nSoporte: 35 KG · Llantas: 7 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-916",
    spec: "Motor 50W, hasta 7 km/h, autonomía 10 km, batería 12V/7Ah",
    description: "Cuatrimoto deportiva con acelerador de pedal\n\nSoporte: 40 KG · Llantas: 8 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-k1",
    spec: "Motor 2x45W, hasta 8 km/h, autonomía 12 km, batería 12V/7Ah",
    description: "Cuatrimoto infantil todoterreno ligera\n\nSoporte: 45 KG · Llantas: 8 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-bdq-s08",
    spec: "Motor 35W, hasta 5 km/h, autonomía 8 km, batería 6V/4.5Ah",
    description: "Montable eléctrico infantil básico para niños pequeños\n\nSoporte: 30 KG · Llantas: 6 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-e10s",
    spec: "Motor 200W, hasta 16 km/h, autonomía 15 km, batería 24V/5.2Ah",
    description: "Minibici eléctrica para niños mayores de 8 años\n\nSoporte: 60 KG · Llantas: 8 Pulg · Material: Acero Ligero",
  },
  {
    slug: "vehiculo-infantil-e11",
    spec: "Motor 250W, hasta 18 km/h, autonomía 15 km, batería 24V/6Ah",
    description: "Scooter de mayor potencia con freno de disco trasero para niños\n\nSoporte: 60 KG · Llantas: 8 Pulg · Material: Aluminio",
  },
  {
    slug: "vehiculo-infantil-e2",
    spec: "Motor 150W, hasta 12 km/h, autonomía 10 km, batería 24V/4Ah",
    description: "Scooter eléctrico ligero para niños con limitador de velocidad\n\nSoporte: 50 KG · Llantas: 6.5 Pulg · Material: Aluminio / ABS",
  },
  {
    slug: "vehiculo-infantil-e6",
    spec: "Motor 180W, hasta 14 km/h, autonomía 12 km, batería 24V/4.5Ah",
    description: "Scooter infantil plegable con luces en la base y ruedas\n\nSoporte: 50 KG · Llantas: 6.5 Pulg · Material: Aluminio",
  },
  {
    slug: "vehiculo-infantil-e8",
    spec: "Motor 200W, hasta 15 km/h, autonomía 12 km, batería 24V/5Ah",
    description: "Scooter eléctrico con manubrio ajustable en altura\n\nSoporte: 55 KG · Llantas: 7 Pulg · Material: Aluminio",
  },
  {
    slug: "vehiculo-infantil-j2",
    spec: "Motor 2x150W, hasta 15 km/h, autonomía 15 km, batería 24V/7Ah",
    description: "Kart de carreras infantil con derrape controlado\n\nSoporte: 60 KG · Llantas: 8 Pulg · Material: Acero y ABS",
  },
  {
    slug: "vehiculo-infantil-jl-005",
    spec: "Motor 4x45W, hasta 10 km/h, autonomía 15 km, batería 12V/10Ah",
    description: "Vehículo tipo Buggy todoterreno infantil\n\nSoporte: 55 KG · Llantas: 10 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-jl-006",
    spec: "Motor 4x55W, hasta 12 km/h, autonomía 18 km, batería 24V/7Ah",
    description: "Vehículo UTV todoterreno de dos plazas para niños\n\nSoporte: 65 KG · Llantas: 12 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-mz007a",
    spec: "Motor 2x55W, hasta 10 km/h, autonomía 15 km, batería 12V/10Ah",
    description: "Cuatrimoto eléctrica grande para niños con llantas de gomas tipo EVA\n\nSoporte: 50 KG · Llantas: 10 Pulg · Material: Plástico ABS / Metal",
  },
  {
    slug: "vehiculo-infantil-mz007b",
    spec: "Motor 2x55W, hasta 10 km/h, autonomía 15 km, batería 12V/10Ah",
    description: "Cuatrimoto con diseño de carreras y suspensión alta\n\nSoporte: 50 KG · Llantas: 10 Pulg · Material: Plástico ABS / Metal",
  },
  {
    slug: "vehiculo-infantil-mz008",
    spec: "Motor 50W, hasta 7 km/h, autonomía 12 km, batería 12V/7Ah",
    description: "Moto eléctrica estilo pista con luces LED\n\nSoporte: 40 KG · Llantas: 8 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-mz008b",
    spec: "Motor 2x45W, hasta 8 km/h, autonomía 12 km, batería 12V/7Ah",
    description: "Moto montable con ruedas de entrenamiento removibles\n\nSoporte: 45 KG · Llantas: 8 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-mz008c",
    spec: "Motor 2x45W, hasta 8 km/h, autonomía 12 km, batería 12V/7Ah",
    description: "Edición especial de moto deportiva infantil\n\nSoporte: 45 KG · Llantas: 8 Pulg · Material: Plástico ABS",
  },
  {
    slug: "vehiculo-infantil-nm1",
    spec: "Motor 500W, hasta 22 km/h, autonomía 20 km, batería 36V/12Ah",
    description: "Minimoto cross a gasolina/eléctrica de iniciación\n\nSoporte: 75 KG · Llantas: 10 Pulg · Material: Acero",
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
