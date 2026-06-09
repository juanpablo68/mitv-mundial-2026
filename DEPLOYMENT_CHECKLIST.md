# Checklist de despliegue a producción

## 1. GitHub

- [ ] Crear repositorio nuevo.
- [ ] Subir el contenido de esta carpeta.
- [ ] Verificar que `.env.local` no se suba.
- [ ] Confirmar que `.gitignore` excluye secretos y `.vercel`.

## 2. Supabase

- [ ] Crear proyecto Supabase.
- [ ] Copiar `Project URL`.
- [ ] Copiar `anon public key`.
- [ ] Copiar `service_role key` y guardarla solo como variable de servidor.
- [ ] Ejecutar `supabase/001_schema.sql`.
- [ ] Ejecutar `supabase/002_seed.sql`.
- [ ] Entrar una vez a la app con el correo administrador.
- [ ] Ejecutar `supabase/003_set_admin_example.sql` cambiando el correo.
- [ ] Completar `external_fixture_id` de cada partido cuando se seleccione el proveedor de resultados.

## 3. Telegram

- [ ] Crear bot con BotFather.
- [ ] Copiar `TELEGRAM_BOT_TOKEN`.
- [ ] Agregar bot al grupo/canal, si aplica.
- [ ] Obtener `TELEGRAM_CHAT_ID`.
- [ ] Probar envío desde un partido.

## 4. API de resultados

- [ ] Seleccionar proveedor oficial/comercial.
- [ ] Configurar `RESULTS_API_PROVIDER`.
- [ ] Configurar API key y URL.
- [ ] Mapear `external_fixture_id` en Supabase.
- [ ] Probar `/api/results/sync` desde el panel admin.

## 5. Vercel

- [ ] Importar repositorio desde GitHub.
- [ ] Framework: Next.js.
- [ ] Build command: `npm run build`.
- [ ] Output: automático.
- [ ] Agregar variables de entorno.
- [ ] Agregar `CRON_SECRET` largo y aleatorio.
- [ ] Desplegar.
- [ ] Validar `/api/health`.
- [ ] Validar página principal.
- [ ] Validar login.
- [ ] Validar `/admin` con usuario administrador.

## 6. Revisión final

- [ ] Confirmar que solo aparecen logos de Ufinet y MiTV.
- [ ] Confirmar que los demás medios aparecen solo como texto.
- [ ] Confirmar que la quiniela se describe como recreativa y personal.
- [ ] Confirmar que no hay premios, apuestas ni dinero.
- [ ] Confirmar que no hay secretos en GitHub.
