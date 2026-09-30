# Portal Intermediarios - Backend API

API REST construida con NestJS para la gestión del Portal de Intermediarios.

---

## 🛠️ Tecnologías

- **NestJS v10**
- **TypeScript**
- **MSSQL (SQL Server)**
- **Swagger / OpenAPI** (`/api/docs`)

---

## ⚙️ Configuración (.env)

Copia `.env.example` a `.env` y configura tus credenciales de base de datos:

```env
PORT=3000
SERVER_BD=172.30.149.67
USER_BD=aquintero
PASSWORD_BD=Mundial2026.
NAME_BD=sis2000_QA
NAME_DB_PHP=MYSQL_QA
JWT_SECRET=w*Ff05m66Ks70vT#1t#D6N!#n1p7K$21VA@rr*QT
AMBIENTE='LOCAL'
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

## 📡 Rutas Base y Swagger

- **Prefijo Global de la API:** `http://localhost:3000/api/v1`
- **Health Check:** `http://localhost:3000/api/v1/health`
- **Documentación Swagger:** `http://localhost:3000/api/docs`
