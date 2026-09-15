# Movimax — e-commerce

Tienda en línea de Movimax. **Catálogo activo: solo movilidad eléctrica**
(patines, bicicletas, cascos y repuestos). Celulares se sigue vendiendo
únicamente en tienda física por ahora, e Impermeabilizantes está pendiente
de catálogo — ambas categorías ya existen en la base de datos marcadas como
"Próximamente" para no requerir una migración cuando se activen.

Stack: **Next.js (App Router) + TypeScript + Tailwind CSS + Prisma + SQLite**
(local; fácil de migrar a Postgres para producción — ver abajo).

## Cómo correrlo

```bash
npm install
cp .env.example .env      # ya viene con un valor por defecto que funciona
npm run db:push           # crea las tablas en la base de datos local (dev.db)
npm run db:seed           # carga las categorías y los 10 productos de ejemplo
npm run dev                # http://localhost:3000
```

Otros comandos útiles:

```bash
npm run db:studio   # interfaz visual para ver/editar la base de datos
npm run lint         # revisa el código con ESLint
npm run build        # build de producción (valida tipos también)
```

## Estructura del proyecto

```
prisma/
  schema.prisma      # modelos: Category, Product
  seed.ts             # datos de ejemplo (movilidad eléctrica)

src/
  app/
    layout.tsx         # layout raíz: fuentes, CartProvider, CartDrawer
    globals.css         # tokens de marca (colores, tipografías) + Tailwind
    page.tsx             # landing / home
    catalogo/page.tsx    # catálogo con filtro por categoría (?categoria=slug)

  components/
    Header.tsx, Footer.tsx, Hero.tsx, TrustStrip.tsx
    CategoryGrid.tsx, ProductGrid.tsx, ProductCard.tsx, AddToCartButton.tsx
    icons.tsx            # íconos SVG reutilizables (incluye el rayo de marca)
    cart/
      CartContext.tsx    # estado del carrito (React Context + localStorage)
      CartDrawer.tsx      # panel lateral del carrito

  lib/
    prisma.ts    # cliente de Prisma (singleton)
    format.ts     # formato de precios en MXN
    constants.ts   # nombre de tienda, WhatsApp, etc.
```

## Decisiones y por qué

- **Los precios se guardan en centavos** (`priceCents`, entero) en vez de
  usar decimales, para evitar errores de redondeo típicos de punto flotante.
- **El carrito no tiene checkout con pago todavía.** El botón "Finalizar
  pedido por WhatsApp" arma un mensaje con el resumen del pedido y abre
  WhatsApp directo — funcional desde el día uno sin necesitar una pasarela
  de pago. Cuando se agregue pago en línea (Stripe o Mercado Pago), este
  botón se reemplaza por el flujo de checkout real.
- **SQLite en desarrollo.** Es cero configuración para correr el proyecto
  localmente. Para producción, cambiar el `provider` en
  `prisma/schema.prisma` a `"postgresql"` y `DATABASE_URL` a la conexión de
  Postgres (Vercel Postgres, Neon, Railway, etc.) — el resto del código no
  cambia.
- **Prisma se fijó en la versión 6** (no la más nueva) porque la versión 7
  cambió su forma de configurarse de una manera que todavía no está bien
  documentada/estabilizada; la v6 es la que coincide con casi toda la
  documentación y tutoriales actuales.

## Lo que falta (próximos pasos)

1. **Logo/mascota real**: el rayo que se ve en el header/footer es un ícono
   simplificado hecho a mano — no el personaje real de la mascota. Para
   usar la imagen real: agregar el archivo (PNG o SVG, idealmente con fondo
   transparente) en `public/images/mascota.png` y decirme para reemplazar
   el ícono por la imagen real con `next/image`.
2. **Impermeabilizantes**: en cuanto pases la lista de productos, se agrega
   igual que se hizo con movilidad eléctrica (a `prisma/seed.ts`, o directo
   en una base de datos real si ya está en producción) y se quita la
   bandera `comingSoon` de esa categoría.
3. **Checkout con pago real** (Stripe o Mercado Pago) en vez del WhatsApp.
4. **Panel de administración** para cargar/editar productos sin tocar
   código (por ahora se hace editando `prisma/seed.ts` o con
   `npm run db:studio`).
5. **Cuentas de cliente** (login, historial de pedidos) — no implementado
   todavía, no era parte de este alcance inicial.
