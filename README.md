# Movimax — e-commerce

Tienda en línea de Movimax. **Catálogo activo: solo movilidad eléctrica**
(patines y bicicletas eléctricas). Celulares se sigue vendiendo únicamente en
tienda física por ahora, e Impermeabilizantes está pendiente de catálogo —
ambas categorías ya existen en la base de datos marcadas como "Próximamente"
para no requerir cambios de estructura cuando se activen.

Stack: **Next.js (App Router) + TypeScript + Tailwind CSS + Firebase
(Firestore)**.

## Cómo correrlo

Necesitas un proyecto de Firebase antes de arrancar — ver
["Configura Firebase"](#configura-firebase) más abajo si no tienes uno
todavía.

```bash
npm install
cp .env.example .env      # pon tus credenciales de Firebase y Mercado Pago (ver abajo)
npm run db:seed           # carga las categorías y los productos en Firestore
npm run dev                # http://localhost:3000
```

Otros comandos útiles:

```bash
npm run lint     # revisa el código con ESLint
npm run build     # build de producción (valida tipos también)
```

## Configura Firebase

### 1. Crea el proyecto y la base de datos

1. Entra a [console.firebase.google.com](https://console.firebase.google.com)
   y crea un proyecto (o usa uno existente).
2. En el menú lateral, ve a **Compilación → Firestore Database** → **Crear
   base de datos**. Elige una ubicación (cualquiera de EE.UU./México está
   bien para empezar) y modo de producción.
3. En **Reglas** de Firestore, pega algo como esto — permite que cualquiera
   *lea* el catálogo, pero nadie escribe directo desde el navegador (los
   productos solo se crean/editan a través de las rutas `/api/admin/*`, que
   usan el SDK de administrador y no dependen de estas reglas):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /products/{id}   { allow read: if true; allow write: if false; }
       match /categories/{id} { allow read: if true; allow write: if false; }
       match /orders/{id}     { allow read, write: if false; }
     }
   }
   ```

### 2. Credenciales del cliente (lectura pública del catálogo)

En **Configuración del proyecto → General → Tus apps**, agrega una app web
(ícono `</>`) si no tienes una. Copia los valores que te da a tu `.env`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Credenciales de administrador (servidor)

En **Configuración del proyecto → Cuentas de servicio → Generar nueva clave
privada** — descarga un archivo `.json`. **No lo subas al repositorio ni lo
dejes en `src/secrets/`** aunque esa carpeta esté en `.gitignore`; en vez de
eso, copia tres campos de ese JSON a tu `.env`:

```
FIREBASE_PROJECT_ID=el-mismo-project_id-del-json
FIREBASE_CLIENT_EMAIL=el-client_email-del-json
FIREBASE_PRIVATE_KEY="el-private_key-del-json-completo-con-BEGIN-y-END"
```

`FIREBASE_PRIVATE_KEY` es una clave larga de varias líneas — cópiala tal
cual viene en el JSON (con los `\n` incluidos si así vienen); el código ya
se encarga de convertirlos a saltos de línea reales.

Esto es lo mismo que hace que el proyecto funcione tanto en tu computadora
como una vez publicado en Vercel — un archivo `.json` en disco no
sobreviviría ahí, pero variables de entorno sí.

## Panel de administración

`/admin/productos` es una página simple para agregar, editar y borrar
productos sin tocar código. Está protegida con una clave compartida (no es
un login de usuario con contraseña, es más parecido a una "clave de acceso"
única):

1. Pon un valor en `.env`: `ADMIN_API_KEY="algo-largo-y-difícil-de-adivinar"`.
2. Entra a `/admin/productos` en el navegador y captura esa misma clave
   cuando te la pida.

Cualquiera con esa clave puede administrar el catálogo — trátala como una
contraseña (no la compartas por WhatsApp/correo sin cifrar, cámbiala si
crees que se filtró).

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
apuntando a esa dirección pública. Deja `ngrok http 3000` corriendo en una
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

Verás el pedido reflejado en la colección `orders` de Firestore (consola de
Firebase → Firestore Database) — pasa de `pending` a `paid` cuando el
webhook confirma el pago.

### 5. Para producción

Repite los pasos con las **credenciales de producción** de la misma
aplicación (dejan de empezar con `TEST-`), y configura el webhook de
producción apuntando a `https://tudominio.com/api/webhooks/mercadopago`.

## Publicar el sitio (Vercel)

1. Entra a [vercel.com](https://vercel.com) y crea una cuenta — usa
   **"Continue with GitHub"** para conectarla directo a tu cuenta de GitHub.
2. **"Add New" → "Project"**, selecciona el repositorio `movimax-e-commerce`.
3. Confirma que la rama a desplegar sea la correcta (`claude/proyecto-anterior-ay3mbf`,
   o la que estén usando).
4. Antes de darle "Deploy", en **"Environment Variables"** agrega **todas**
   las variables que tienes en tu `.env` — las de Firebase (cliente y
   admin), Mercado Pago, y `ADMIN_API_KEY`.
5. Dale **"Deploy"**.

Con Vercel conectado a GitHub, cada `git push` a la rama conectada
actualiza el sitio publicado solo, en un par de minutos.

## Estructura del proyecto

```
scripts/
  seed-firestore.ts    # carga/limpia categorías y productos en Firestore

src/
  app/
    layout.tsx           # layout raíz: fuentes, CartProvider, CartDrawer
    globals.css           # tokens de marca (colores, tipografías) + Tailwind
    page.tsx               # landing / home
    catalogo/page.tsx      # catálogo con filtro por categoría (?categoria=slug)
    admin/productos/page.tsx # panel simple para administrar productos
    pedido/
      exito/page.tsx        # a donde Mercado Pago redirige tras un pago aprobado
      pendiente/page.tsx    # a donde redirige con una ficha OXXO sin pagar todavía
      cancelado/page.tsx    # a donde redirige si el pago se rechaza o cancela
    api/
      checkout/route.ts                # crea la preferencia de Checkout Pro
      webhooks/mercadopago/route.ts    # confirma pagos (tarjeta y OXXO)
      admin/products/route.ts          # listar/crear productos (protegido)
      admin/products/[id]/route.ts     # editar/borrar un producto (protegido)

  components/
    Header.tsx, Footer.tsx, Hero.tsx, TrustStrip.tsx
    CategoryGrid.tsx, ProductGrid.tsx, ProductCard.tsx, AddToCartButton.tsx
    icons.tsx            # íconos SVG reutilizables (incluye el rayo de marca)
    cart/
      CartContext.tsx    # estado del carrito (React Context + localStorage)
      CartDrawer.tsx      # panel lateral del carrito, botón de pago

  lib/
    firebase.ts        # cliente de Firebase (para el navegador)
    firebase-admin.ts   # cliente de Firebase Admin (lazy, solo en servidor)
    products.ts          # lecturas de Firestore vía SDK de cliente
    types.ts               # tipos compartidos (Category, Product, ...)
    admin-auth.ts            # verifica la clave del panel de administración
    mercadopago.ts             # config de Mercado Pago (lazy)
    format.ts                    # formato de precios en MXN
    constants.ts                   # nombre de tienda, WhatsApp, etc.
```

## Decisiones y por qué

- **Firestore, no una base de datos SQL.** El proyecto empezó con
  Postgres/Prisma, pero se migró a Firebase — decisión del negocio, no
  técnica: mantener todo en un solo ecosistema de Google/Firebase era más
  importante que la base de datos específica.
- **Las credenciales de Firebase Admin se leen de variables de entorno**,
  nunca de un archivo `.json` de cuenta de servicio importado directo en el
  código — un archivo así no sobrevive un despliegue en Vercel (no hay disco
  persistente entre despliegues) y además es un riesgo de seguridad si
  alguna vez se sube por accidente a git.
- **La conexión a Firebase Admin es "perezosa"** (`getAdminDb()`, no un
  valor ya calculado al cargar el archivo) — así, si faltan credenciales,
  falla con un mensaje claro solo cuando algo realmente intenta usarla, en
  vez de tumbar `next build` completo o cualquier página que ni siquiera
  toca la base de datos.
- **El pago es con Checkout Pro de Mercado Pago** (página de pago alojada
  por Mercado Pago, no un formulario de tarjeta hecho a mano) — así el
  proyecto nunca toca ni guarda datos de tarjetas, y Mercado Pago se encarga
  de cumplir PCI-DSS. WhatsApp quedó solo como canal de dudas, no como forma
  de pago.
- **La confirmación del pago la hace el webhook, no la página de éxito.**
  Un cliente puede cerrar el navegador después de pagar y el pedido igual
  se marca como pagado, porque Mercado Pago le avisa al servidor
  directamente (firmado y verificado con `MERCADOPAGO_WEBHOOK_SECRET`).
  Esto es obligatorio para OXXO: el cliente paga la ficha días después, en
  la tienda, sin volver a abrir el sitio — el webhook es la única forma de
  enterarnos de que sí pagó. El "marcar como pagado" usa una transacción de
  Firestore para que, si Mercado Pago reintenta la notificación, el stock
  nunca se descuente dos veces.
- **El precio de cada producto se vuelve a consultar en el servidor** al
  crear la preferencia de pago (`/api/checkout`), nunca se confía en el
  precio que mande el navegador — evita que alguien manipule el precio
  antes de pagar.
- **El panel de administración usa una sola clave compartida**
  (`ADMIN_API_KEY`), no cuentas de usuario individuales — suficiente para
  una sola persona administrando el catálogo; si más adelante varias
  personas necesitan acceso con permisos distintos, ahí sí conviene un
  sistema de login real.

## Lo que falta (próximos pasos)

1. **Logo/mascota real**: el rayo que se ve en el header/footer es un ícono
   simplificado hecho a mano — no el personaje real de la mascota. Para
   usar la imagen real: agregar el archivo (PNG o SVG, idealmente con fondo
   transparente) en `public/images/mascota.png` y decirme para reemplazar
   el ícono por la imagen real con `next/image`.
2. **Impermeabilizantes**: en cuanto pases la lista de productos, se agrega
   igual que se hizo con movilidad eléctrica (a `scripts/seed-firestore.ts`,
   o directo desde el panel `/admin/productos`) y se quita la bandera
   `comingSoon` de esa categoría.
3. **Correos automáticos** — Mercado Pago ya manda un recibo de pago, pero
   avisos propios de Movimax (confirmación de envío, etc.) no están hechos.
4. **Publicar en Mercado Libre** — no es parte de este código (es un listado
   de productos en su marketplace, no algo que se "programe" aquí), pero al
   compartir la misma cuenta de Mercado Pago, los pagos de ambos canales
   quedan en un solo lugar para conciliar.
5. **Cuentas de cliente** (login, historial de pedidos) — no implementado
   todavía, no era parte de este alcance inicial.
