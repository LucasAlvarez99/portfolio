# 🗄️ Configuración Completa de Supabase

## 📋 **Paso 1: Crear Cuenta y Proyecto**

### 1. Registro en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Regístrate con GitHub, Google o email
# 🗄️ Configuración Completa de Supabase

## 📋 **Paso 1: Crear Cuenta y Proyecto**

### 1. Registro en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Regístrate con GitHub, Google o email
4. Verifica tu email

### 2. Crear Nuevo Proyecto
1. En el dashboard, clic en "New Project"
2. Completa los datos:
   - **Name**: `portfolio-lucas-alvarez`
   - **Database Password**: (genera una segura)
   - **Region**: South America (São Paulo) - más cercano a Argentina
   - **Pricing Plan**: Free (suficiente para empezar)
3. Clic en "Create new project"
4. Esperar 2-3 minutos mientras se configura

## 🏗️ **Paso 2: Crear las Tablas**

### 1. Acceder al Editor SQL
1. En tu proyecto, ve a "SQL Editor"
2. Haz clic en "New query"
3. Ejecuta los siguientes scripts:

### 2. Tabla de Proyectos
```sql
-- Crear tabla de proyectos
CREATE TABLE projects (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  image text NOT NULL,
  link text NOT NULL,
  github text NOT NULL,
  technologies jsonb NOT NULL DEFAULT '[]'::jsonb,
  views integer DEFAULT 0,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_featured ON projects(featured) WHERE featured = true;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$ language 'plpgsql';

-- Trigger para updated_at
CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

### 3. Tabla de Configuración del Portfolio
```sql
-- Crear tabla de configuración
CREATE TABLE portfolio_config (
  id bigserial PRIMARY KEY,
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Trigger para updated_at
CREATE TRIGGER update_portfolio_config_updated_at 
    BEFORE UPDATE ON portfolio_config 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insertar configuración por defecto
INSERT INTO portfolio_config (key, value) VALUES
('personal_info', '{
  "name": "Lucas Alvarez",
  "title": "Desarrollador Web",
  "email": "lucas.alvarez.bernardez.99@gmail.com",
  "phone": "+54 9 123 456 7890",
  "location": "Buenos Aires, Argentina"
}'::jsonb),
('about_texts', '{
  "text1": "¡Hola! Soy Lucas Alvarez, un desarrollador web apasionado por crear experiencias digitales excepcionales. Con más de 3 años de experiencia en el desarrollo frontend y backend, me especializo en construir aplicaciones web modernas y funcionales.",
  "text2": "Mi enfoque se centra en escribir código limpio, escalable y mantener las mejores prácticas de desarrollo. Me encanta aprender nuevas tecnologías y mantenerme actualizado con las últimas tendencias del desarrollo web.",
  "text3": "Cuando no estoy programando, disfruto de la fotografía, los videojuegos y explorar nuevos lugares. Siempre estoy abierto a nuevos desafíos y oportunidades de colaboración."
}'::jsonb),
('stats', '{
  "projects": 15,
  "experience": 3,
  "satisfaction": 100
}'::jsonb);
```

### 4. Tabla de Mensajes de Contacto
```sql
-- Crear tabla de mensajes
CREATE TABLE contact_messages (
  id bigserial PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  ip_address inet,
  user_agent text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Índices
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX idx_contact_messages_read ON contact_messages(read);
```

### 5. Tabla de Estadísticas
```sql
-- Crear tabla de estadísticas
CREATE TABLE analytics (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Índices
CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at DESC);
```

## 🔐 **Paso 3: Configurar Row Level Security (RLS)**

### 1. Habilitar RLS
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
```

### 2. Políticas de Seguridad
```sql
-- Proyectos: Lectura pública, escritura solo autenticados
CREATE POLICY "Proyectos visibles para todos" ON projects
    FOR SELECT USING (true);

CREATE POLICY "Solo admins pueden modificar proyectos" ON projects
    FOR ALL USING (auth.role() = 'authenticated');

-- Configuración: Lectura pública, escritura solo autenticados
CREATE POLICY "Configuración visible para todos" ON portfolio_config
    FOR SELECT USING (true);

CREATE POLICY "Solo admins pueden modificar configuración" ON portfolio_config
    FOR ALL USING (auth.role() = 'authenticated');

-- Mensajes: Solo inserción pública, lectura solo admins
CREATE POLICY "Cualquiera puede enviar mensajes" ON contact_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Solo admins pueden leer mensajes" ON contact_messages
    FOR SELECT USING (auth.role() = 'authenticated');

-- Analytics: Solo inserción pública, lectura solo admins
CREATE POLICY "Cualquiera puede generar analytics" ON analytics
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Solo admins pueden leer analytics" ON analytics
    FOR SELECT USING (auth.role() = 'authenticated');
```

## 🔑 **Paso 4: Obtener las Credenciales**

### 1. URL del Proyecto
1. Ve a "Settings" → "API"
2. Copia la **Project URL**
3. Ejemplo: `https://abcdefghijk.supabase.co`

### 2. Anon Key
1. En la misma página, copia la **anon public key**
2. Ejemplo: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. Service Role Key (Opcional, para admin)
1. Copia también la **service_role key** (solo para operaciones admin)
2. ⚠️ **NUNCA** uses esta key en el frontend

## 🚀 **Paso 5: Configurar en el Portfolio**

### 1. En admin.html
1. Ve al panel admin
2. En la sección "Configuración de Supabase"
3. Pega la **Project URL**
4. Pega la **Anon Key**
5. Haz clic en "Probar Conexión"
6. Si es exitoso, haz clic en "Guardar Config"

### 2. Datos de Ejemplo
```sql
-- Insertar proyectos de ejemplo
INSERT INTO projects (title, description, image, link, github, technologies) VALUES
('E-Commerce App', 
 'Aplicación de comercio electrónico completa con carrito de compras, sistema de pagos y panel de administración.',
 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
 'https://ecommerce-demo.vercel.app',
 'https://github.com/lucasalvarez/ecommerce-app',
 '["React", "Node.js", "MongoDB", "Stripe"]'::jsonb),

('Task Manager',
 'Gestor de tareas colaborativo con funciones de equipo, calendario integrado y notificaciones en tiempo real.',
 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=200&fit=crop',
 'https://taskmanager-demo.vercel.app',
 'https://github.com/lucasalvarez/task-manager',
 '["Vue.js", "Firebase", "Tailwind"]'::jsonb),

('Dashboard Analytics',
 'Dashboard interactivo para análisis de datos con gráficos dinámicos y reportes automatizados.',
 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
 'https://dashboard-demo.vercel.app',
 'https://github.com/lucasalvarez/dashboard-analytics',
 '["React", "D3.js", "Express", "PostgreSQL"]'::jsonb);
```

## 📊 **Paso 6: Storage para Imágenes (Opcional)**

### 1. Crear Bucket
```sql
-- Crear bucket para imágenes del portfolio
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-images', 'portfolio-images', true);
```

### 2. Políticas de Storage
```sql
-- Permitir lectura pública de imágenes
CREATE POLICY "Imágenes públicas" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-images');

-- Permitir subida solo a usuarios autenticados
CREATE POLICY "Solo admins pueden subir" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolio-images' AND auth.role() = 'authenticated');
```

## 🔧 **Paso 7: Funciones de Base de Datos**

### 1. Función para incrementar views
```sql
CREATE OR REPLACE FUNCTION increment_project_views(project_id bigint)
RETURNS void AS $
BEGIN
    UPDATE projects 
    SET views = views + 1 
    WHERE id = project_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Función para estadísticas de dashboard
```sql
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS json AS $
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'total_projects', (SELECT count(*) FROM projects),
        'total_views', (SELECT sum(views) FROM projects),
        'total_messages', (SELECT count(*) FROM contact_messages),
        'unread_messages', (SELECT count(*) FROM contact_messages WHERE read = false)
    ) INTO result;
    
    RETURN result;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
```

## ✅ **Paso 8: Verificar Todo**

### 1. Test en SQL Editor
```sql
-- Verificar que todo funciona
SELECT * FROM projects;
SELECT * FROM portfolio_config;
SELECT get_dashboard_stats();
```

### 2. Test en el Portfolio
1. Ve al panel admin
2. Haz clic en "Probar Conexión"
3. Debe aparecer "¡Conexión exitosa a Supabase!"
4. Los proyectos deben cargarse automáticamente

## 🎯 **Límites del Plan Gratuito**

- **Base de Datos**: 500 MB
- **Bandwidth**: 5 GB/mes  
- **Storage**: 1 GB
- **Usuarios**: Ilimitados
- **Requests**: 50,000/mes

¡Perfecto para un portfolio personal!

## 🆘 **Troubleshooting**

### Error de Conexión
- Verifica que la URL termine en `.supabase.co`
- Asegúrate de usar la **anon key**, no la service key
- Revisa la consola del navegador para errores

### Error de Permisos
- Verifica que RLS esté configurado correctamente
- Las políticas deben permitir lectura pública
- Para insertar, puede necesitar autenticación

### Proyectos No Cargan
- Ejecuta `SELECT * FROM projects;` en SQL Editor
- Si está vacío, ejecuta los INSERT de ejemplo
- Verifica las políticas de RLS

¡Con esta configuración tendrás una base de datos profesional para tu portfolio! 🚀 Verifica tu email

### 2. Crear Nuevo Proyecto
1. En el dashboard, clic en "New Project"
2. Completa los datos:
   - **Name**: `portfolio-lucas-alvarez`
   - **Database Password**: (genera una segura)
   - **Region**: South America (São Paulo) - más cercano a Argentina
   - **Pricing Plan**: Free (suficiente para empezar)
3. Clic en "Create new project"
