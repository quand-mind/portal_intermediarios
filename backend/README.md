# Portal Intermediarios - Backend API

API REST construida con NestJS para la gestión del Portal de Intermediarios.

---

## 🛠️ Tecnologías

- **NestJS v10**
- **TypeScript**
- **MSSQL (SQL Server)**
- **JWT (jsonwebtoken)**
- **Nodemailer (SMTP Emails)**
- **Swagger / OpenAPI** (`/api/docs`)

---

## ⚙️ Configuración (.env)

Copia `.env.example` a `.env` y configura tus credenciales de base de datos y correo:

```env
PORT=3000
SERVER_BD=172.30.149.67
USER_BD=aquintero
PASSWORD_BD=Mundial2026.
NAME_BD=sis2000_QA
NAME_DB_PHP=MYSQL_QA
JWT_SECRET=w*Ff05m66Ks70vT#1t#D6N!#n1p7K$21VA@rr*QT
JWT_EXPIRES_IN=24h
JWT_RESET_EXPIRES_IN=1h
AMBIENTE='LOCAL'

# Credenciales de Correo (SMTP)
USER_EMAIL=seguroslamundial@gmail.com
PASS_EMAIL=vyeazhrymlylxsdb
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# URL del Frontend para enlace de reset
FRONTEND_URL=http://localhost:4200
```

---

## 🚀 Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run start:dev

# Compilar proyecto
npm run build

# Modo producción
npm run start:prod
```

---

## 📡 Módulos y Rutas Principales

Prefijo base: `http://localhost:3000/api/v1`

### 1. 🔐 Auth (`/api/v1/auth`)

Consulta directamente la tabla `seusuariosweb`:

| Método | Endpoint | Descripción | Payload / Token |
|---|---|---|---|
| `POST` | `/auth/forgot-password` | Verifica si el correo existe en `xcorreo`, genera token JWT con `{ email, id: xusuario, type: 'reset' }` y envía correo con plantilla HTML. | `{ "email": "usuario@correo.com" }` |
| `POST` | `/auth/reset-password` | Valida el email, verifica que el token contenga los datos enviados (`email`, `id`, `type: 'reset'`) y actualiza la contraseña en `seusuariosweb`. | `{ "email": "...", "token": "...", "password": "..." }` |
| `POST` | `/auth/login` | Valida credenciales contra `seusuariosweb` (`xcorreo`/`xlogin` y `xcontrasena`) y retorna token JWT con `{ email, id: xusuario, type: 'logged' }` junto a los datos del usuario. | `{ "email": "...", "password": "..." }` |

### 2. 🩺 Health (`/api/v1/health`)
- `GET /health`: Health check del servicio y estado de la conexión a SQL Server.

### 3. 📄 Documentación Swagger
- `http://localhost:3000/api/docs`
