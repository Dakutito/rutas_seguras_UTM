# 🚀 PASOS PARA DESPLEGAR - PASO A PASO

## ✅ PASO 1: Desplegar BACKEND a RENDER

### 1. Ir a https://render.com

### 2. Crear Web Service

### 3. Configuración básica:

- Name: `rutas-seguras-backend`
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

### 4. Environment Variables (Hacer click en "+ Add Environment Variable"):

```
PORT                        5000
NODE_ENV                    production
DB_HOST                     your-project.supabase.co
DB_USER                     postgres
DB_PASSWORD                 [Tu contraseña]
DB_NAME                     postgres
DB_PORT                     5432
DB_SSL                      true
CORS_ORIGIN                 *
EMAIL_HOST                  smtp.gmail.com
EMAIL_PORT                  587
EMAIL_USER                  [Tu email]
EMAIL_PASSWORD              [Tu contraseña app]
JWT_SECRET                  [Genera uno aleatorio]
DATABASE_URL                [Tu URL completa de Supabase]
```

### 5. Deploy

### 6. **ESPERA 2-3 MINUTOS** hasta que compile

### 7. **COPIA LA URL** que te da Render

```
Ejemplo: https://rutas-seguras-backend.onrender.com
```

---

## ✅ PASO 2: Desplegar FRONTEND a VERCEL

### 1. Ir a https://vercel.com

### 2. Importar proyecto

### 3. Configuración:

- Root Directory: `frontend`
- Framework: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

### 4. Environment Variables (Hacer click en "+ Add Environment Variable"):

```
VITE_API_URL    https://rutas-seguras-backend.onrender.com/api
```

(Reemplaza la URL del backend con la que obtuviste en PASO 1)

### 5. Deploy

### 6. **ESPERA 1-2 MINUTOS** hasta que compile

### 7. **COPIA LA URL** que te da Vercel

```
Ejemplo: https://rutas-seguras.vercel.app
```

---

## ✅ PASO 3: Actualizar CORS en RENDER

### 1. Vuelve a Render

### 2. Entra a tu Backend Service

### 3. Settings > Environment > CORS_ORIGIN

### 4. Cambia:

```
De: CORS_ORIGIN=*
A:  CORS_ORIGIN=https://rutas-seguras.vercel.app
```

(Usa la URL de Vercel del PASO 2)

### 5. Click "Deploy"

### 6. **Espera 1-2 minutos** a que redeploy

### 7. ✅ **¡LISTO!**

---

## 🧪 Prueba que Funciona

1. Abre https://rutas-seguras.vercel.app
2. Intenta hacer login/registro
3. Sube una foto
4. Crea un reporte
5. Si todo funciona = ✅ SUCCESS

Si no funciona, revisa:

- ✅ CORS_ORIGIN en Render es correcto
- ✅ VITE_API_URL en Vercel es correcto
- ✅ Database URL en Render es correcto
- ✅ Backend compiló sin errores

---

## 📌 NOTAS IMPORTANTES

- **Plan FREE de Render**: Inicia lentamente en el primer acceso (tarda ~1 min)
- **Las URLs cambian**: Cada vez que redeploy, la URL sigue siendo la misma
- **CORS_ORIGIN=\*** es temporal: Después actualízalo con la URL real
- **NO dejes variables vacías**: Todas deben tener valores
