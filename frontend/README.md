# RutasSegurasUTM

Proyecto de aplicación web para la seguridad vial, que permite a los usuarios registrar rutas seguras.
## Características Principales

- **Gestión de Rutas**: Registro y seguimiento de rutas seguras.
- **Panel de Administración**: Gestión de usuarios y rutas desde una interfaz de administración.
- **Navbar Responsiva**: Diseño adaptable a dispositivos móviles y de escritorio.
- **Animaciones**: Transiciones y efectos visuales para una mejor experiencia de usuario.

## Tecnologías Utilizadas

### Frontend

- **React**: Librería de JavaScript para la interfaz de usuario.
- **Vite**: Entorno de desarrollo rápido y empaquetador.
- **JavaScript**: Lenguaje de programación.
- **CSS**: Hojas de estilo para el diseño de la aplicación.

### Backend

- **Node.js**: Entorno de ejecución de JavaScript.
- **Express**: Framework web de Node.js.
- **PostgreSQL**: Base de datos relacional.
- **jsonwebtoken**: Autenticación de usuarios.
- **bcrypt**: Manejo de contraseñas.

## Requisitos Previos

- **Node.js** (versión 14 o superior).

## Instalación

### 1. Clonar el repositorio

```bash
cd frontend
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
BACKEND_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
```

## Uso

### Ejecutar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.
