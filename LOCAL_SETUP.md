# Setup Local - Rutas Seguras

## 🚀 Instalación para Desarrollo

### 1. Clonar el repositorio

```bash
git clone <tu-repo>
cd rutasSeguras
```

### 2. Instalar dependencias

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

### 3. Configurar Variables de Entorno

#### Backend - `backend/.env`

Copia el contenido de `backend/.env.example` y llena con tus datos:

```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=tu-password
DB_NAME=rutas_seguras
DB_PORT=5432
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
JWT_SECRET=tu-secreto-super-seguro
```

#### Frontend - `frontend/.env.local`

```
VITE_API_URL=http://localhost:5000/api
```

### 4. Base de Datos Local

#### Opción A: PostgreSQL Local

```bash
cd backend
npm run migrate
```

#### Opción B: PostgreSQL con Docker

```bash
docker run --name rutas-seguras-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=rutas_seguras \
  -p 5432:5432 \
  -d postgres:15
```

### 5. Ejecutar Aplicación

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

Debería ver: `Servidor corriendo en puerto 5000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

Accede a: `http://localhost:5173`

---

## 📁 Estructura de Directorios

```
rutasSeguras/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env (⚠️ no en Git)
│   ├── .env.example
│   ├── config/
│   ├── database/
│   ├── middleware/
│   ├── routes/
│   └── uploads/
├── frontend/
│   ├── package.json
│   ├── .env.local (⚠️ no en Git)
│   ├── .env.example
│   ├── vite.config.js
│   └── src/
├── .gitignore
└── DEPLOYMENT.md
```

---

## 🐛 Troubleshooting

### Backend no inicia

- ✅ Verificar que PostgreSQL está running
- ✅ Verificar `.env` values
- ✅ Revisar puertos: `lsof -i :5000` (macOS/Linux) o `netstat -ano | findstr :5000` (Windows)

### Frontend no se conecta al backend

- ✅ Backend debe estar running en `localhost:5000`
- ✅ Verificar CORS_ORIGIN en backend
- ✅ Revisar console del navegador para errores

### Errores de imagen/uploads

- ✅ Crear carpeta `backend/uploads/profiles/`
- ✅ Restart backend
