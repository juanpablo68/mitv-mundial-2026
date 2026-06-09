# Prompt para Antigravity - implementación producción

Actúa como ingeniero senior full-stack especializado en Next.js, Supabase, Vercel y despliegues de aplicaciones web de producción.

## Objetivo

Preparar, revisar y desplegar en producción la aplicación `MiTV Mundial 2026`, manteniendo el alcance funcional ya implementado:

- Consulta de partidos del Mundial 2026 por día.
- Filtro por medio de transmisión.
- Selección del medio donde el usuario verá cada partido.
- Envío de avisos por Telegram.
- Descarga de evento `.ics` y enlace a Google Calendar.
- Quiniela recreativa personal por usuario.
- Resultados sincronizados desde API oficial/proveedor.
- Panel administrador para modificar partidos, horarios, medios, transmisiones y resultados de respaldo.
- Autenticación con Supabase.
- Persistencia en Supabase Postgres.
- Despliegue en Vercel conectado a GitHub.

## Reglas de marca

- Mantener los logos de Ufinet y MiTV ubicados en `public/logos`.
- No agregar logos de canales externos ni de terceros.
- Mostrar Tigo Sports, FOX, Canal 11 Guatemala, Canal 7 Guatemala, Canal 13 Guatemala, Canal 3 Guatemala y Canal 4 El Salvador solo como texto/marca en la parrilla.

## Reglas de seguridad

- No hardcodear secretos.
- No exponer `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `RESULTS_API_KEY` ni `CRON_SECRET` al cliente.
- Usar `NEXT_PUBLIC_*` solamente para variables públicas.
- Mantener RLS habilitado en Supabase.
- Validar que `/api/results/sync` solo pueda ejecutarse por usuario admin o cron autorizado.

## Tareas de implementación

1. Revisar que el proyecto compile con:
   - `npm install`
   - `npm run typecheck`
   - `npm run build`
2. Corregir cualquier error TypeScript o de build sin alterar el alcance funcional.
3. Validar que la app funcione en modo demo sin Supabase.
4. Validar que con Supabase configurado:
   - el usuario pueda ingresar por magic link,
   - pueda guardar sus pronósticos,
   - pueda seleccionar medio por partido,
   - el administrador pueda modificar calendario, medios y resultados.
5. Confirmar que el endpoint `/api/health` responda correctamente.
6. Confirmar que `/api/telegram` no exponga tokens.
7. Confirmar que `/api/results/sync` use variables de entorno y `external_fixture_id` para mapear resultados.
8. Preparar commit para GitHub.
9. Preparar variables de entorno para Vercel.
10. Desplegar en Vercel.

## Criterios de aceptación

- La página principal carga sin errores.
- `/admin` solo habilita funciones a usuarios con rol `admin`.
- Los usuarios normales no pueden leer ni modificar quinielas de otros usuarios.
- Las transmisiones se muestran como texto, no como logos externos.
- El cron de Vercel puede llamar `/api/results/sync` usando `CRON_SECRET`.
- Los resultados actualizan automáticamente la evaluación de pronósticos.
- El build de Vercel termina exitosamente.

## Archivos clave

- `app/page.tsx`: interfaz principal.
- `app/admin/page.tsx`: panel administrador.
- `app/api/results/sync/route.ts`: sincronización de resultados.
- `app/api/telegram/route.ts`: envío de mensajes.
- `components/AuthBar.tsx`: autenticación Supabase.
- `lib/matches.ts`: calendario demo/local.
- `supabase/001_schema.sql`: esquema y RLS.
- `supabase/002_seed.sql`: datos base.
- `supabase/003_set_admin_example.sql`: conversión de usuario a admin.
- `vercel.json`: cron de resultados.
- `.env.example`: variables requeridas.
