# ECOTIENDA - Sistema POS

Sistema de Punto de Venta completo con gestion de inventario, ventas, cajas registradoras, proveedores y respaldos.

---

## Caracteristicas

- Gestion de productos con categorias, stock y precios variables
- Punto de venta (POS) con carrito y multiples metodos de pago
- Multiples cajas registradoras con asignacion de categorias
- Cierres de caja con balance de apertura/cierre
- Gestion de proveedores y pagos
- Sistema de deudas/transferencias de clientes
- Sistema de respaldos de base de datos
- Acceso multi-dispositivo por red local
- Control de licencias y roles (admin/cajero)

---

## Requisitos

- Node.js >= 18
- npm

> **Ya no requiere MongoDB.** La base de datos SQLite se crea automaticamente.

---

## Instalacion

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/jhonsu01/Pos-Tiendas-Negocios
   cd Pos-Tiendas-Negocios
   ```

2. Instalar dependencias del backend:
   ```bash
   cd backend
   npm install
   ```

3. Instalar dependencias del frontend:
   ```bash
   cd ../frontend
   npm install
   ```

4. Configurar variables de entorno:
   ```bash
   cd ../backend
   cp .env.example .env
   # Editar .env con tus valores
   ```

5. (Opcional) Cargar datos iniciales:
   ```bash
   npm run seed
   ```

6. Iniciar la aplicacion:
   ```bash
   npm start
   ```

   La base de datos SQLite se crea automaticamente en `data/database.sqlite`.

---

## Variables de Entorno

| Variable | Descripcion | Default |
|----------|-------------|---------|
| `PORT` | Puerto del servidor | `5000` |
| `DB_PATH` | Ruta de la base de datos SQLite | `./data/database.sqlite` |
| `JWT_SECRET` | Secreto para tokens JWT | `secret123` |
| `NODE_ENV` | Entorno de ejecucion | `development` |

---

## API Endpoints

### Autenticacion
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/users/login` | Login |
| POST | `/api/users` | Registrar usuario |
| GET | `/api/users` | Listar usuarios (admin) |
| PUT | `/api/users/:id` | Actualizar usuario (admin) |
| DELETE | `/api/users/:id` | Eliminar usuario (admin) |

### Productos
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/products` | Listar productos |
| GET | `/api/products/:id` | Obtener producto |
| POST | `/api/products` | Crear producto (admin) |
| PUT | `/api/products/:id` | Actualizar producto (admin) |
| DELETE | `/api/products/:id` | Eliminar producto (admin) |
| PUT | `/api/products/reorder` | Reordenar productos (admin) |

### Ventas
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/sales` | Crear venta |
| GET | `/api/sales` | Listar ventas (admin) |
| GET | `/api/sales/:id` | Obtener venta |
| PUT | `/api/sales/:id` | Actualizar venta (admin) |
| DELETE | `/api/sales/:id` | Eliminar venta (admin) |

### Cajas Registradoras
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/registers` | Listar cajas |
| POST | `/api/registers` | Crear caja (admin) |
| PUT | `/api/registers/:id` | Actualizar caja (admin) |
| DELETE | `/api/registers/:id` | Eliminar caja (admin) |
| GET | `/api/registers/:id/summary` | Resumen de ventas por fecha |
| POST | `/api/registers/:id/close` | Cerrar caja |
| GET | `/api/registers/accumulated` | Totales acumulados |

### Categorias
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/categories` | Listar categorias activas |
| POST | `/api/categories` | Crear categoria (admin) |
| PUT | `/api/categories/:id` | Actualizar categoria (admin) |
| DELETE | `/api/categories/:id` | Desactivar categoria (admin) |

### Proveedores
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/suppliers` | Listar proveedores |
| POST | `/api/suppliers` | Crear proveedor (admin) |
| POST | `/api/suppliers/:id/payment` | Registrar pago (admin) |
| GET | `/api/suppliers/payments/all` | Listar todos los pagos (admin) |

### Transferencias (Deudas)
| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | `/api/transfers` | Crear deuda |
| GET | `/api/transfers` | Listar deudas pendientes |
| PUT | `/api/transfers/:id/pay` | Pagar deuda |
| DELETE | `/api/transfers/:id` | Cancelar deuda |

---

## Estructura del Proyecto

```
Pos-Tiendas-Negocios/
├── backend/
│   ├── database/
│   │   ├── connection.js        # Conexion SQLite
│   │   ├── schema.sql           # Esquema de tablas
│   │   └── seed.js              # Datos iniciales
│   ├── data/
│   │   └── database.sqlite      # Base de datos (auto-generada)
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── uploads/                 # Imagenes de productos
│   ├── backups/                 # Respaldos de BD
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   └── package.json
└── SCRIPTS/                     # Scripts .bat de control
```

---

## Base de Datos

Este proyecto usa **SQLite** mediante `better-sqlite3`. La base de datos se inicializa automaticamente al arrancar la aplicacion.

- Esquema: `database/schema.sql`
- Conexion: `database/connection.js`
- Seed: `database/seed.js`

### Respaldar la base de datos

```bash
# Metodo simple: copiar el archivo
cp data/database.sqlite data/database_backup.sqlite

# Via API (desde la interfaz web o curl)
curl -X POST http://localhost:5000/api/backups/create -H "Authorization: Bearer <token>"
```

---

## Scripts Disponibles

### Backend
| Comando | Descripcion |
|---------|-------------|
| `npm start` | Inicia el servidor |
| `npm run dev` | Inicia en modo desarrollo (nodemon) |
| `npm run seed` | Carga datos iniciales |

### Frontend
| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Inicia en modo desarrollo |
| `npm run build` | Genera build de produccion |

---

## Tecnologias

- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Base de datos**: SQLite (better-sqlite3)
- **Frontend**: React 19 + Vite + Tailwind CSS
- **Estado**: Zustand
- **Autenticacion**: JWT (jsonwebtoken)

---

## Usuarios por Defecto

Al ejecutar `npm run seed`:

| Usuario | Contrasena | Rol |
|---------|------------|-----|
| admin | admin | Admin |
| jose | 1234 | Admin |

**Cambia las contrasenas** despues del primer inicio.

---

## Acceso en Red Local

1. Inicia el backend (`npm start` en `/backend`)
2. Inicia el frontend (`npm run dev` en `/frontend`)
3. Accede desde otro dispositivo usando la IP local mostrada en consola

---

**Version**: 3.0 - SQLite
**Ultima actualizacion**: Marzo 2026
