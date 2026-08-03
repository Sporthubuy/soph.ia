# Admin Setup Guide

## Crear Usuario Admin en Supabase

### Opción 1: Usar el script de seeding (Recomendado)

```bash
npm run db:seed
```

Este script automáticamente:
- Crea el usuario `rg.aviaga@gmail.com` con contraseña `Xaxi.4112`
- Lo marca como admin en la tabla `admin_roles`
- Maneja duplicados gracefully

**Requisitos**: Tener las siguientes variables de entorno:
```
NEXT_PUBLIC_SUPABASE_URL=<tu-url>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
```

### Opción 2: Crear manualmente en Supabase Console

1. Ve a [Supabase Console](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a `Authentication > Users`
4. Haz clic en `Add user`
5. Ingresa:
   - Email: `rg.aviaga@gmail.com`
   - Password: `Xaxi.4112`
   - Confirm: `Xaxi.4112`
6. Haz clic en `Create user`

### Opción 3: Crear con SQL en Supabase

Ve a `SQL Editor` en Supabase Console y ejecuta:

```sql
-- Create the user
SELECT auth.create_user(
  email := 'rg.aviaga@gmail.com',
  password := 'Xaxi.4112',
  email_confirm := true
);

-- Get the user ID
SELECT id FROM auth.users WHERE email = 'rg.aviaga@gmail.com';

-- Mark as admin (reemplaza USER_ID con el ID del usuario anterior)
INSERT INTO public.admin_roles (user_id, role)
VALUES ('USER_ID', 'admin')
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin', updated_at = now();
```

## Verificar que funciona

1. Ve a `http://localhost:3000/login/admin`
2. Ingresa:
   - Email: `rg.aviaga@gmail.com`
   - Password: `Xaxi.4112`
3. Deberías acceder al dashboard de admin

## Troubleshooting

### "Invalid login credentials"
- Verifica que el usuario fue creado correctamente en Supabase Auth
- Asegúrate de que la contraseña es exactamente `Xaxi.4112`
- Comprueba que `email_confirm` es `true`

### "Forbidden" al acceder a /admin
- El usuario existe pero no tiene rol de admin
- Ejecuta el SQL anterior para marcar como admin
- O usa el script de seeding

### El script de seeding falla
- Verifica que tienes las env vars correctas
- Asegúrate de tener `SUPABASE_SERVICE_ROLE_KEY` (no la anon key)
- Ejecuta `npm run db:push` primero para crear la tabla `admin_roles`

## Variables de Entorno Necesarias

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://upyyjwyvkbvjjfxhntzc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>

# Neo4j (opcional)
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password

# APIs (opcional)
ANTHROPIC_API_KEY=<tu-key>
OPENAI_API_KEY=<tu-key>
```
