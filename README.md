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
cp .env.example .env      # trae DATABASE_URL listo; agrega tus credenciales de Mercado Pago (ver abajo)
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

## Pagos con Mercado Pago (tarjeta + OXXO)

El carrito paga de verdad, con Checkout Pro de Mercado Pago: tarjeta y pago
en efectivo en OXXO. Sin las credenciales configuradas, el botón "Pagar con
tarjeta o en OXXO" muestra un error claro en vez de fallar en silencio — así
sabes exactamente qué falta.

### 1. Crea tus credenciales de prueba

1. Entra a [mercadopago.com.mx/developers/panel](https://www.mercadopago.com.mx/developers/panel)
   con tu cuenta (o crea una — no necesitas tener el negocio verificado
   todavía para probar en modo sandbox).
2. Crea una aplicación ("Tus integraciones" → "Crear aplicación").
3. Dentro de la aplicación, en **Credenciales de prueba**, copia el
   **Access Token de prueba** (empieza con `TEST-...`) a
   `MERCADOPAGO_ACCESS_TOKEN` en tu `.env`.

### 2. Configura el secreto del webhook

Dentro de la misma aplicación, ve a **Webhooks** → configura una URL (puede
ser cualquier valor por ahora, se sobrescribe en cada pago porque el código
manda la URL real dinámicamente) y copia la **clave secreta** que te dan ahí
a `MERCADOPAGO_WEBHOOK_SECRET` en tu `.env`. Esa clave es la que usa el
código para verificar que una notificación realmente viene de Mercado Pago
y no de alguien más.

### 3. Prueba los webhooks en tu máquina (necesitas una URL pública)

A diferencia de correr todo en `localhost`, Mercado Pago sí necesita poder
*llamarte a ti* para avisarte que un pago se completó — especialmente
importante en OXXO, donde el pago pasa días después del checkout. Para eso
necesitas exponer tu servidor local con [ngrok](https://ngrok.com/download):

```bash
ngrok http 3000
```

Copia la URL pública que te da (algo como `https://abc123.ngrok-free.app`)
y **abre el sitio desde esa URL**, no desde `localhost:3000` — así, cuando
pagues algo, el código arma automáticamente las URLs de vuelta y de webhook
apuntando a esa dirección pública. Dejar `ngrok http 3000` corriendo en una
terminal aparte mientras pruebas pagos.

### 4. Prueba un pago

Con `npm run dev` y `ngrok` corriendo, agrega algo al carrito desde la URL
de ngrok y dale "Pagar con tarjeta o en OXXO". Como usas un Access Token de
prueba (`TEST-...`), Mercado Pago te manda automáticamente a su ambiente de
sandbox — necesitas un **usuario de prueba comprador** para pagar ahí (se
crea en el mismo panel de desarrolladores, en **Usuarios de prueba**; te da
un correo y contraseña para iniciar sesión en el checkout).

- **Tarjeta de prueba**: Mercado Pago publica números de tarjeta de prueba
  por país en su documentación (busca "tarjetas de prueba México" en sus
  docs) — usa el número junto con un nombre que incluya la palabra
  `APRO` para que se apruebe automáticamente.
- **OXXO de prueba**: se genera una ficha de prueba; puedes simular que se
  pagó desde el mismo panel de desarrolladores (sección de simulación de
  notificaciones/pagos).

Verás el pedido reflejado en `npm run db:studio` (tabla `Order`) — pasa de
`pending` a `paid` cuando el webhook confirma el pago.

### 5. Para producción

Repite los pasos con las **credenciales de producción** de la misma
aplicación (dejan de empezar con `TEST-`), y configura el webhook de
producción apuntando a `https://tudominio.com/api/webhooks/mercadopago`.

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
      exito/page.tsx       # a donde Mercado Pago redirige tras un pago aprobado
      pendiente/page.tsx   # a donde redirige con una ficha OXXO sin pagar todavía
      cancelado/page.tsx   # a donde redirige si el pago se rechaza o cancela
    api/
      checkout/route.ts               # crea la preferencia de Checkout Pro
      webhooks/mercadopago/route.ts   # confirma pagos (tarjeta y OXXO)

  components/
    Header.tsx, Footer.tsx, Hero.tsx, TrustStrip.tsx
    CategoryGrid.tsx, ProductGrid.tsx, ProductCard.tsx, AddToCartButton.tsx
    icons.tsx            # íconos SVG reutilizables (incluye el rayo de marca)
    cart/
      CartContext.tsx    # estado del carrito (React Context + localStorage)
      CartDrawer.tsx      # panel lateral del carrito, botón de pago

  lib/
    prisma.ts        # cliente de Prisma (singleton)
    mercadopago.ts    # config de Mercado Pago (lazy, no truena páginas sin credenciales)
    format.ts          # formato de precios en MXN
    constants.ts        # nombre de tienda, WhatsApp, etc.
```

## Decisiones y por qué

- **Los precios se guardan en centavos** (`priceCents`, entero) en vez de
  usar decimales, para evitar errores de redondeo típicos de punto flotante.
- **El pago es con Checkout Pro de Mercado Pago** (página de pago alojada
  por Mercado Pago, no un formulario de tarjeta hecho a mano) — así el
  proyecto nunca toca ni guarda datos de tarjetas, y Mercado Pago se encarga
  de cumplir PCI-DSS. WhatsApp quedó solo como canal de dudas, no como forma
  de pago. Se eligió sobre Stripe porque el cliente ya opera con Mercado
  Pago y planea vender también en Mercado Libre — mismo ecosistema, misma
  cuenta.
- **La confirmación del pago la hace el webhook, no la página de éxito.**
  Un cliente puede cerrar el navegador después de pagar y el pedido igual
  se marca como pagado, porque Mercado Pago le avisa al servidor
  directamente (firmado y verificado con `MERCADOPAGO_WEBHOOK_SECRET`, para
  confirmar que la notificación es real). Esto es obligatorio para OXXO: el
  cliente paga la ficha días después, en la tienda, sin volver a abrir el
  sitio — el webhook es la única forma de enterarnos de que sí pagó.
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
3. **Configurar Mercado Pago con tus propias credenciales** (ver sección de
   Pagos arriba) — el código ya está, pero necesita tu cuenta para funcionar.
4. **Correos automáticos** — Mercado Pago ya manda un recibo de pago, pero
   avisos propios de Movimax (confirmación de envío, etc.) no están hechos.
5. **Publicar en Mercado Libre** — no es parte de este código (es un listado
   de productos en su marketplace, no algo que se "programe" aquí), pero al
   compartir la misma cuenta de Mercado Pago, los pagos de ambos canales
   quedan en un solo lugar para conciliar.
6. **Panel de administración** para cargar/editar productos y ver pedidos
   sin tocar código (por ahora se hace editando `prisma/seed.ts` o con
   `npm run db:studio`).
7. **Cuentas de cliente** (login, historial de pedidos) — no implementado
   todavía, no era parte de este alcance inicial.
