# Movimax E-commerce

Movimax - comercio al por menor o mayoreo de comunicación y accesorios.

## Estructura del proyecto

```
movimax-e-commerce/
├── client/   # Frontend: React + Vite + Tailwind CSS
└── server/   # Backend: Node.js + Express + MongoDB (Mongoose)
```

## Estado actual

- ✅ Landing page (hero, productos destacados, sección de contacto)
- ✅ Catálogo de productos con filtro por categoría y búsqueda
- ✅ API REST para productos y categorías conectada a MongoDB
- ✅ Modelo de usuario (`server/src/models/User.js`) con contraseñas
  encriptadas con bcrypt, listo como base para la siguiente etapa
  (registro, login y autenticación con JWT)

## Requisitos

- Node.js 18+
- Una base de datos MongoDB (local o en la nube, por ejemplo MongoDB Atlas)

## Configuración

### 1. Backend

```bash
cd server
cp .env.example .env
# Edita .env y coloca tu cadena de conexión de MongoDB en MONGODB_URI
npm install
npm run seed   # carga productos de ejemplo en la base de datos
npm run dev    # inicia el servidor en http://localhost:4000
```

### 2. Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev    # inicia la app en http://localhost:5173
```

Con ambos servicios corriendo, abre `http://localhost:5173` para ver la
landing page y `http://localhost:5173/catalogo` para el catálogo.

## Variables de entorno

**server/.env**

| Variable        | Descripción                                   |
| --------------- | ---------------------------------------------- |
| `PORT`          | Puerto del servidor (por defecto 4000)         |
| `MONGODB_URI`   | Cadena de conexión a MongoDB                   |
| `CLIENT_ORIGIN` | Origen permitido por CORS (URL del frontend)   |

**client/.env**

| Variable       | Descripción                          |
| -------------- | ------------------------------------- |
| `VITE_API_URL` | URL base de la API (`/api` incluido) |

## Próxima etapa

- Registro e inicio de sesión de usuarios (JWT + cookies seguras)
- Carrito de compras y checkout
- Panel de administración para gestionar el catálogo
