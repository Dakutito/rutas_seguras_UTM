# Guía de Despliegue - Rutas Seguras

## 📋 Variables de Entorno

### Frontend (Vercel)

```
VITE_API_URL=https://tu-backend-render.onrender.com/api
```

### Backend (Render)

```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
CORS_ORIGIN=https://tu-frontend-vercel.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
JWT_SECRET=tu-secreto-super-seguro-muy-largo
```

---

## 1️⃣ Configurar Base de Datos en Supabase

1. Crea una cuenta en https://supabase.com
2. Crea un nuevo proyecto
3. Ve a **Settings > Database > Connection String**
4. Copia la URL de conexión tipo:
   ```
   postgresql://postgres.xxxxx:password@db.supabase.co:5432/postgres
   ```
5. Esta será tu `DATABASE_URL`

### Ejecutar migraciones en Supabase

```bash
npm run migrate
```

---

## 2️⃣ Desplegar Backend en Render

1. Ve a https://render.com
2. Conecta tu repositorio GitHub
3. Crea nuevo "Web Service"
4. **Configuración:**
   - **Name:** rutas-seguras-backend
   - **Environment:** Node
   - **Root Directory:** `backend` ⭐ (Importante)
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (o Paid según necesites)

5. En **Settings > Environment**:
   - Agrega todas las variables del archivo `.env.example` del backend
   - **IMPORTANTE:** `DATABASE_URL` debe ser tu URL de Supabase

6. Copia la URL que te asigna Render (algo como: `https://tu-backend-render.onrender.com`)

---

## 3️⃣ Desplegar Frontend en Vercel

1. Ve a https://vercel.com
2. Conecta tu repositorio GitHub
3. Importa el proyecto
4. **Configuración:**
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. En **Settings > Environment Variables**:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://tu-backend-render.onrender.com/api`
   - Selecciona todos los ambientes (Production, Preview, Development)

6. Deploy!

---

## 4️⃣ Actualizar CORS en Backend

Después que tengas la URL de Vercel, actualiza en Render:

- **CORS_ORIGIN:** Tu URL final de Vercel (ej: `https://tu-app.vercel.app`)

---

## ⚙️ Configurar Email (Gmail)

Para usar Gmail con tu backend:

1. Habilita "Acceso a aplicaciones menos seguras" O usa una contraseña de aplicación:
   - Crea una contraseña específica para la app: https://myaccount.google.com/apppasswords
   - Usa esa contraseña en `EMAIL_PASSWORD`

2. En Render, agrega:
   - `EMAIL_USER=tu-email@gmail.com`
   - `EMAIL_PASSWORD=tu-contraseña-app`

---

## 🔒 Consideraciones de Seguridad

- ✅ `.env` NO debe estar en Git (está en `.gitignore`)
- ✅ Usa contraseñas fuertes para `JWT_SECRET` y `DATABASE_URL`
- ✅ Las variables sensibles solo en Render/Vercel, nunca en código
- ✅ El plan Free de Render inicia automáticamente después de 15 min inactivo

---

## 🧪 Probar Despliegue

1. Frontend: Accede a tu URL de Vercel
2. Backend: Ve a `https://tu-backend-render.onrender.com/api` (deberías ver error 404, eso está bien)
3. Verifica que el login/registro funciona

---

## 📝 Notas Importantes

- Render puede tardar 2-3 min en hacer deploy
- El primer acceso a Render puede ser lento (plan Free)
- Las imágenes de perfil se suben a `/uploads` en el backend
- Para producción, considera storage externo (AWS S3, Cloudinary, etc.)
