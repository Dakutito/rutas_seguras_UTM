# 🚀 Guía Rápida: Despliegue Rutas Seguras

## 📋 Resumen del Plan

| Componente        | Plataforma | Tecnología        |
| ----------------- | ---------- | ----------------- |
| **Frontend**      | Vercel     | React + Vite      |
| **Backend**       | Render     | Node.js + Express |
| **Base de Datos** | Supabase   | PostgreSQL        |
| **Email**         | Gmail SMTP | Nodemailer        |

---

## ✅ CHECKLIST DE PASOS

### PARTE 1: Preparación Local ⚙️

- [ ] Crear `.env` en `frontend/` con `VITE_API_URL=http://localhost:5000/api`
- [ ] Crear `.env` en `backend/` con datos de tu PostgreSQL local
- [ ] Instalar dependencias: `npm install` en frontend y backend
- [ ] Probar localmente que funciona todo

### PARTE 2: Supabase (Base de Datos) 🗄️

1. [ ] Ir a https://supabase.com y crear cuenta
2. [ ] Crear nuevo proyecto
3. [ ] Ir a **Settings > Database > Connection String**
4. [ ] Copiar la URL (será tu **DATABASE_URL**)
5. [ ] Ejecutar migraciones: `npm run migrate` (desde backend/)
6. [ ] Verificar que las tablas se crearon en Supabase

**Conexión String de Supabase:**

```
postgresql://postgres.[ID].[REGION]:PASSWORD@db.[REGION].supabase.co:5432/postgres
```

### PARTE 3: Deploy Backend en Render 🔌

1. [ ] Ir a https://render.com
2. [ ] Conectar cuenta GitHub
3. [ ] Click en "+ New" > "Web Service"
4. [ ] Seleccionar el repositorio
5. [ ] **Configuración:**
   - **Name:** `rutas-seguras-backend`
   - **Environment:** Node
   - **Root Directory:** `backend` ⭐
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. [ ] Click "Create Web Service"
7. [ ] Esperar a que compile (2-3 min)
8. [ ] Copiar la URL que te asigna (ej: `https://rutas-seguras-backend.onrender.com`)

**En Render Settings > Environment Variables, agregar:**

```
NODE_ENV=production
DATABASE_URL=postgresql://...  (tu URL de Supabase)
CORS_ORIGIN=https://tu-frontend-vercel.vercel.app  (lo actualizarás después)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-app
JWT_SECRET=genera-una-contraseña-super-segura-muy-larga
```

### PARTE 4: Deploy Frontend en Vercel 🎨

1. [ ] Ir a https://vercel.com
2. [ ] Conectar cuenta GitHub
3. [ ] Click "Import Project"
4. [ ] Seleccionar el repositorio
5. [ ] **Configuración:**
   - **Root Directory:** `frontend`
   - **Framework:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. [ ] Click "Deploy"
7. [ ] Esperar a que compile
8. [ ] Copiar la URL de Vercel (ej: `https://rutas-seguras.vercel.app`)

**En Vercel Settings > Environment Variables, agregar:**

```
VITE_API_URL=https://rutas-seguras-backend.onrender.com/api
```

(Aplica a: Production, Preview, Development)

### PARTE 5: Actualizar Backend con URL de Frontend 🔗

1. [ ] Volver a Render
2. [ ] Ir a tu servicio backend
3. [ ] Settings > Environment Variables
4. [ ] Actualizar `CORS_ORIGIN`:
   ```
   https://rutas-seguras.vercel.app
   ```
5. [ ] Click "Deploy" para recargar cambios

---

## 🧪 Verificar que Funciona

1. [ ] Accede a `https://tu-frontend-vercel.vercel.app`
2. [ ] Prueba registrarte
3. [ ] Prueba login
4. [ ] Sube una foto de perfil
5. [ ] Crea un reporte
6. [ ] Verifica en Supabase que los datos se guardaron

---

## 🔐 Generar JWT_SECRET Seguro

Como generar un JWT_SECRET aleatorio:

**Opción 1: Usar Node.js**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Opción 2: Usar OpenSSL**

```bash
OpenSSL rand -hex 32
```

Copia ese resultado a `JWT_SECRET` en Render

---

## ⚠️ Cosas Importantes

1. **CORS_ORIGIN**: Es la URL de tu frontend en Vercel. Sin CORS correcto, no funcionará el frontend
2. **DATABASE_URL**: Usa la Connection String de Supabase, NO la que aparece en el Dashboard
3. **EMAIL_PASSWORD**: Si usas Gmail, crea una contraseña de app en https://myaccount.google.com/apppasswords
4. **Plan Free de Render**: Inician automáticamente después de 15 min inactivos (tarde ~1 min en cargar)
5. **Variables de Entorno**: En Vercel/Render NO puedes usar `localhost`

---

## 🆘 Si Algo No Funciona

**Backend no inicia en Render:**

- Revisar logs: Settings > Logs
- Verificar que DATABASE_URL es correcto
- Verificar que todas las variables de entorno están definidas

**Frontend no se conecta:**

- Revisar console del navegador (F12 > Console)
- Verificar CORS_ORIGIN en backend
- Verificar que VITE_API_URL es correcto

**Supabase no connect:**

- Verificar formato de DATABASE_URL
- Revisar que la contraseña es correcta
- En Supabase, Settings > Database > Connection String

---

## 📞 URLs Importantes

- **Supabase:** https://supabase.com
- **Render:** https://render.com
- **Vercel:** https://vercel.com
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords

---

## 🎉 ¡Listo!

Una vez que todo funcione, tu aplicación estará:

- ✅ Live en Vercel (tu frontend)
- ✅ Running en Render (tu backend)
- ✅ Data guardada en Supabase (tu BD)

**Próximos pasos opcionales:**

- Agregar dominio personalizado
- Configurar Analytics
- Backup automático de Supabase
- CDN para imágenes
