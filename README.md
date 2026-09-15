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
cp .env.example .env      # trae DATABASE_URL listo; agrega tus llaves de Stripe (ver abajo)
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

## Pagos con Stripe (tarjeta + OXXO)

El carrito paga de verdad, con Stripe Checkout: tarjeta y depósito en OXXO
(muy usado en México para quien no tiene tarjeta). Sin las llaves de Stripe
configuradas, el botón "Pagar con tarjeta o en OXXO" muestra un error claro
en vez de fallar en silencio — así sabes exactamente qué falta.

### 1. Crea una cuenta de Stripe (modo de prueba, no requiere negocio verificado)

1. Entra a [dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Una vez dentro, asegúrate de estar en **modo de prueba** (toggle "Test mode"
   arriba a la derecha) — así no se cobra dinero real mientras desarrollas.
3. Activa OXXO como método de pago: **Configuración → Métodos de pago** →
   busca "OXXO" y actívalo (en modo de prueba ya suele venir disponible).

### 2. Copia tus llaves a `.env`

En **Desarrolladores → Claves de API** copia la "Clave secreta" (empieza con
`sk_test_...`) a `STRIPE_SECRET_KEY` en tu `.env`.

### 3. Prueba los webhooks en tu máquina (Stripe CLI)

Los webhooks son lo que confirma que un pago se completó — especialmente
importante en OXXO, donde el pago pasa días después del checkout, no al
momento. Para probarlos en local necesitas el Stripe CLI:

```bash
# instalar (Windows con scoop, o descarga el binario desde stripe.com/docs/stripe-cli)
scoop install stripe

# iniciar sesión (abre el navegador)
stripe login

# reenviar eventos de Stripe a tu servidor local
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Ese último comando imprime un `whsec_...` — cópialo a `STRIPE_WEBHOOK_SECRET`
en tu `.env` y reinicia `npm run dev`. Déjalo corriendo en una terminal
aparte mientras pruebas pagos.

### 4. Prueba un pago

Con `npm run dev` y `stripe listen` corriendo, agrega algo al carrito y dale
"Pagar con tarjeta o en OXXO". En la página de Stripe:

- **Tarjeta de prueba**: `4242 4242 4242 4242`, cualquier fecha futura,
  cualquier CVC.
- **OXXO de prueba**: Stripe genera una ficha de prueba; en modo de prueba
  puedes marcarla como pagada manualmente desde el Dashboard de Stripe
  (Pagos → busca el PaymentIntent → "Marcar como pagado fuera de línea" o
  similar, la opción exacta varía).

Verás el pedido reflejado en `npm run db:studio` (tabla `Order`) — pasa de
`pending` a `paid` cuando el webhook confirma el pago.

### 5. Para producción

Repite los pasos con las llaves de **modo live** (`sk_live_...`), y en vez
del Stripe CLI configura el webhook desde el Dashboard (**Desarrolladores →
Webhooks → Agregar endpoint**) apuntando a
`https://tudominio.com/api/webhooks/stripe`, escuchando los eventos:
`checkout.session.completed`, `checkout.session.async_payment_succeeded`,
`checkout.session.async_payment_failed`, `checkout.session.expired`.

## Estructura del proyecto

```
prisma/
  schema.prisma      # modelos: Category, Product, Order, OrderItem
  seed.ts             # datos de ejemplo (movilidad eléctrica)

src/
  app/
    layout.tsx         # layout raíz: fuentes, CartProvider, CartDrawer
    globals.css         # tokens de marca (colores, tipografías) + Tailwind
    page.tsx             # landing / home
    catalogo/page.tsx    # catálogo con filtro por categoría (?categoria=slug)
    pedido/
      exito/page.tsx      # a donde Stripe redirige tras pagar
      cancelado/page.tsx  # a donde Stripe redirige si el cliente cancela
    api/
      checkout/route.ts        # crea la sesión de Stripe Checkout
      webhooks/stripe/route.ts # confirma pagos (tarjeta y OXXO)

  components/
    Header.tsx, Footer.tsx, Hero.tsx, TrustStrip.tsx
    CategoryGrid.tsx, ProductGrid.tsx, ProductCard.tsx, AddToCartButton.tsx
    icons.tsx            # íconos SVG reutilizables (incluye el rayo de marca)
    cart/
      CartContext.tsx    # estado del carrito (React Context + localStorage)
      CartDrawer.tsx      # panel lateral del carrito, botón de pago

  lib/
    prisma.ts    # cliente de Prisma (singleton)
    stripe.ts     # cliente de Stripe (lazy, no truena páginas sin llaves)
    format.ts     # formato de precios en MXN
    constants.ts   # nombre de tienda, WhatsApp, etc.
```

## Decisiones y por qué

- **Los precios se guardan en centavos** (`priceCents`, entero) en vez de
  usar decimales, para evitar errores de redondeo típicos de punto flotante.
- **El pago es con Stripe Checkout** (página de pago alojada por Stripe, no
  un formulario de tarjeta hecho a mano) — así el proyecto nunca toca ni
  guarda datos de tarjetas, y Stripe se encarga de cumplir PCI-DSS. WhatsApp
  quedó solo como canal de dudas, no como forma de pago.
- **La confirmación del pago la hace el webhook, no la página de éxito.**
  Un cliente puede cerrar el navegador después de pagar y el pedido igual
  se marca como pagado, porque Stripe le avisa al servidor directamente.
  Esto es obligatorio para OXXO: el cliente paga la ficha días después, en
  la tienda, sin volver a abrir el sitio — el webhook es la única forma de
  enterarnos de que si pagó.
- **El precio de cada producto se vuelve a consultar en el servidor** al
  crear la sesión de pago (`/api/checkout`), nunca se confía en el precio
  que mande el navegador — evita que alguien manipule el precio antes de
  pagar.
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
3. **Configurar Stripe con tus propias llaves** (ver sección de Pagos arriba)
   — el código ya está, pero necesita tu cuenta de Stripe para funcionar.
4. **Correos automáticos** — Stripe ya manda un recibo de pago, pero avisos
   propios de Movimax (confirmación de envío, etc.) no están hechos.
5. **Panel de administración** para cargar/editar productos y ver pedidos
   sin tocar código (por ahora se hace editando `prisma/seed.ts` o con
   `npm run db:studio`).
6. **Cuentas de cliente** (login, historial de pedidos) — no implementado
   todavía, no era parte de este alcance inicial.
