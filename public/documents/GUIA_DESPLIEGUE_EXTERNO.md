# Guía de Despliegue - Encuentros Dialógicos Universidad de Cundinamarca

## 📋 Requisitos Previos

### Software necesario
- **Node.js** v18+ (recomendado v20 LTS)
- **npm** v9+ o **bun** v1+
- **Git**
- Servidor web: **Nginx** o **Apache**
- (Opcional) **Docker** y **Docker Compose**

### Servicios externos
- **Supabase** (proyecto propio o self-hosted)
  - Base de datos PostgreSQL 15+
  - Autenticación (Supabase Auth)
  - Edge Functions (Deno runtime)
  - Storage (para archivos)

---

## 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd encuentros-dialogicos
```

---

## 2. Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
VITE_SUPABASE_PROJECT_ID=tu_project_id
```

> ⚠️ **IMPORTANTE**: La `PUBLISHABLE_KEY` es la clave pública (anon key) de Supabase. Nunca exponer la `SERVICE_ROLE_KEY` en el frontend.

---

## 3. Instalación de Dependencias

```bash
npm install
# o con bun:
bun install
```

---

## 4. Build de Producción

```bash
npm run build
# o
bun run build
```

Esto genera la carpeta `dist/` con los archivos estáticos listos para servir.

---

## 5. Configuración de Base de Datos (Supabase)

### 5.1 Crear proyecto en Supabase
1. Ir a [https://supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Anotar las credenciales: URL, anon key, service role key

### 5.2 Ejecutar migraciones SQL
Ejecutar en orden los archivos de la carpeta `supabase/migrations/` en el SQL Editor de Supabase, o usar el CLI:

```bash
npx supabase db push --db-url postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
```

### 5.3 Esquema de Base de Datos

El archivo `public/database-schema.sql` contiene el esquema completo. Las tablas principales son:

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfiles de usuarios |
| `user_roles` | Roles (admin, docente, estudiante) |
| `coordinadores_autorizados` | Lista blanca de coordinadores |
| `estudiantes_autorizados` | Lista blanca de estudiantes |
| `evaluaciones` | Evaluaciones de estudiantes |
| `student_evaluations` | Evaluaciones detalladas por herramienta |
| `cursos` | Cursos creados por docentes |
| `momento_progreso` | Progreso por momento |
| `actas_encuentro` | Actas de encuentros dialógicos |

### 5.4 Funciones de Base de Datos

Las siguientes funciones deben existir en la BD:

- `handle_new_user()` — Trigger para crear perfil y asignar rol al registrarse
- `has_role(user_id, role)` — Verificar rol de usuario
- `can_access_moment(estudiante_id, momento)` — Control de acceso secuencial
- `update_updated_at_column()` — Actualizar timestamps

### 5.5 Políticas RLS (Row Level Security)

Asegurarse de que RLS esté habilitado en todas las tablas y que las políticas estén configuradas correctamente. Consultar los archivos de migración para las políticas específicas.

---

## 6. Edge Functions (Funciones Backend)

### Funciones disponibles:

| Función | Descripción | JWT |
|---------|-------------|-----|
| `import-excel` | Importar datos desde Excel | No |
| `bulk-import-xlsx` | Importación masiva de estudiantes | No |
| `create-admin` | Crear usuario administrador | No |
| `create-docente` | Crear usuario docente | Sí |
| `update-user-role` | Cambiar rol de usuario | Sí |

### Desplegar Edge Functions con Supabase CLI:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
npx supabase login

# Vincular proyecto
npx supabase link --project-ref tu_project_id

# Desplegar todas las funciones
npx supabase functions deploy import-excel --no-verify-jwt
npx supabase functions deploy bulk-import-xlsx --no-verify-jwt
npx supabase functions deploy create-admin --no-verify-jwt
npx supabase functions deploy create-docente
npx supabase functions deploy update-user-role
```

### Secrets para Edge Functions:

```bash
npx supabase secrets set SUPABASE_URL=https://tu-proyecto.supabase.co
npx supabase secrets set SUPABASE_ANON_KEY=tu_anon_key
npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

---

## 7. Configuración del Servidor Web

### Opción A: Nginx

```nginx
server {
    listen 80;
    server_name tu-dominio.edu.co;
    root /var/www/encuentros-dialogicos/dist;
    index index.html;

    # Compresión gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # SPA: redirigir todas las rutas a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estáticos
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SSL (recomendado con Certbot/Let's Encrypt)
    # listen 443 ssl;
    # ssl_certificate /etc/letsencrypt/live/tu-dominio.edu.co/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/tu-dominio.edu.co/privkey.pem;
}
```

### Opción B: Apache (.htaccess)

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>

# Compresión
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>

# Cache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

---

## 8. Despliegue con Docker (Opcional)

### Dockerfile

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
      - "443:443"
    restart: unless-stopped
    environment:
      - VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
      - VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
```

```bash
docker-compose up -d --build
```

---

## 9. Crear Usuario Administrador

Después del despliegue, ejecutar:

```bash
curl -X POST https://tu-proyecto.supabase.co/functions/v1/create-admin
```

Esto crea el usuario admin con las credenciales predefinidas en la función.

> ⚠️ **IMPORTANTE**: Cambiar las credenciales del administrador en `supabase/functions/create-admin/index.ts` antes de desplegar en producción.

---

## 10. Importar Datos Iniciales

### Coordinadores y Estudiantes
Usar la interfaz de administrador (`/admin` → pestaña Importar) o ejecutar directamente:

```bash
curl -X POST https://tu-proyecto.supabase.co/functions/v1/bulk-import-xlsx \
  -H "Content-Type: application/json" \
  -d '{"file_url": "URL_DEL_ARCHIVO_XLSX"}'
```

---

## 11. Stack Tecnológico

| Componente | Tecnología | Versión |
|-----------|------------|---------|
| Frontend | React + TypeScript | 18.3 |
| Build Tool | Vite | 5.x |
| UI Framework | Tailwind CSS + shadcn/ui | 3.x |
| Routing | React Router DOM | 6.x |
| State Management | TanStack Query | 5.x |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) | 2.x |
| Gráficas | Recharts | 2.x |
| PDF Export | jsPDF + jsPDF-AutoTable | 3.x |
| Excel Parse | SheetJS (xlsx) | 0.18 |

---

## 12. Estructura del Proyecto

```
├── public/
│   ├── data/                    # Datos Excel
│   ├── documents/               # PDFs y documentos
│   └── favicon.ico
├── src/
│   ├── assets/                  # Imágenes
│   ├── components/
│   │   ├── admin/               # Componentes de administración
│   │   ├── auth/                # Formularios de autenticación
│   │   ├── evaluation/          # Herramientas de evaluación
│   │   ├── moments/             # Momentos del proceso
│   │   ├── steps/               # Pasos del caso de estudio
│   │   └── ui/                  # Componentes UI (shadcn)
│   ├── data/                    # Configuraciones estáticas
│   ├── hooks/                   # Custom hooks
│   ├── integrations/supabase/   # Cliente y tipos Supabase
│   ├── lib/                     # Utilidades
│   ├── pages/                   # Páginas principales
│   ├── types/                   # Tipos TypeScript
│   └── utils/                   # Funciones utilitarias
├── supabase/
│   ├── functions/               # Edge Functions
│   └── migrations/              # Migraciones SQL
└── .env                         # Variables de entorno
```

---

## 13. Roles y Permisos

| Rol | Acceso |
|-----|--------|
| **admin** | Panel completo, gestión usuarios, importación datos |
| **docente** | Dashboard docente, gestión cursos, seguimiento |
| **estudiante** | Dashboard estudiante, evaluaciones, momentos |

---

## 14. Checklist de Despliegue

- [ ] Clonar repositorio
- [ ] Configurar `.env` con credenciales de Supabase
- [ ] Ejecutar `npm install`
- [ ] Ejecutar migraciones de base de datos
- [ ] Configurar RLS policies
- [ ] Desplegar Edge Functions
- [ ] Configurar secrets en Supabase
- [ ] Ejecutar `npm run build`
- [ ] Configurar servidor web (Nginx/Apache)
- [ ] Configurar SSL/HTTPS
- [ ] Crear usuario administrador
- [ ] Importar datos de coordinadores y estudiantes
- [ ] Verificar acceso y funcionalidad
- [ ] Cambiar credenciales por defecto del admin

---

## 15. Soporte

Para soporte técnico, contactar al equipo de desarrollo.

**Universidad de Cundinamarca** — Encuentros Dialógicos  
Plataforma de Gestión Académica PAD-CAI
