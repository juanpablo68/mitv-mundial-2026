# MiTV Mundial 2026 - versión Antigravity / Producción

Aplicación web en Next.js para consultar la parrilla de transmisión del Mundial 2026, seleccionar el medio donde se verá cada partido, enviar avisos por Telegram, agregar eventos al calendario y gestionar pronósticos recreativos personales con actualización de resultados por API.

## Alcance incluido

- Next.js App Router listo para GitHub + Vercel.
- Supabase Auth para usuarios por correo/magic link.
- Supabase Postgres para partidos, medios, transmisiones, resultados, quinielas y selección de medio por usuario.
- Panel administrador en `/admin` para modificar partidos, horarios, medios, transmisiones y resultados de respaldo.
- Endpoint de sincronización de resultados en `/api/results/sync`.
- Endpoint de Telegram en `/api/telegram`.
- Cron de Vercel configurado en `vercel.json` para llamar `/api/results/sync` cada hora.
- Logos autorizados de Ufinet y MiTV en `public/logos`.
- Los demás medios aparecen únicamente como marcas/texto, sin logos externos.

## Cómo usarlo en Antigravity

1. Crea un nuevo proyecto en Antigravity.
2. Sube esta carpeta completa o importa el ZIP.
3. Pídele a Antigravity que revise `ANTIGRAVITY_PROMPT.md` antes de modificar código.
4. Conecta el proyecto con tu repositorio GitHub.
5. Haz commit inicial y push a GitHub.
6. Conecta el repositorio con Vercel.
7. Configura las variables de entorno en Vercel usando `.env.example` como base.
8. Crea el proyecto en Supabase y ejecuta los SQL en este orden:
   - `supabase/001_schema.sql`
   - `supabase/002_seed.sql`
   - `supabase/003_set_admin_example.sql`, cambiando primero el correo del administrador.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir:

```bash
http://localhost:3000
```

Para validar compilación:

```bash
npm run typecheck
npm run build
```

## Variables de entorno principales

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
RESULTS_API_PROVIDER=generic
RESULTS_API_URL=
RESULTS_API_HEADER=Authorization
RESULTS_API_KEY=
RESULTS_API_LEAGUE_ID=
RESULTS_API_SEASON=2026
```

## Configuración de resultados por API

La app soporta dos caminos:

1. **generic**: cualquier API propia o proveedor que entregue registros con campos como `id`, `external_fixture_id`, `home_score`, `away_score` y `status`.
2. **api-football**: con `RESULTS_API_PROVIDER=api-football`, `RESULTS_API_KEY`, `RESULTS_API_LEAGUE_ID` y `RESULTS_API_SEASON=2026`.

Importante: para que la sincronización funcione, cada partido en Supabase debe tener `external_fixture_id` igual al ID del proveedor de resultados. Eso se puede llenar desde el panel administrador.

## Seguridad

- `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `RESULTS_API_KEY` y `CRON_SECRET` son variables solo de servidor.
- No se deben colocar en componentes cliente.
- `/api/results/sync` acepta sincronización manual desde un usuario con rol `admin` o por cron usando `Authorization: Bearer CRON_SECRET`.
- Las políticas RLS de Supabase restringen quinielas y medios seleccionados al usuario dueño de los datos.

## Panel administrador

Ruta:

```bash
/admin
```

Para habilitarlo:

1. Ingresar una vez con el correo del administrador desde la app.
2. Ir a Supabase SQL Editor.
3. Ejecutar `supabase/003_set_admin_example.sql` con el correo correcto.
4. Cerrar sesión y volver a ingresar.

## Notas legales y operativas

- Se usan los logos de Ufinet y MiTV porque fueron provistos para este proyecto.
- No se incluyen logos de otros canales o marcas externas; solo nombres de medios en texto.
- La parrilla fue cargada desde las infografías compartidas. Antes de publicación externa conviene validarla contra la fuente oficial o contractual.
- La quiniela está planteada como pronóstico recreativo personal, sin dinero, apuestas ni premios monetarios.
