-- Ejecutar después de que el usuario administrador haya ingresado una vez por magic link.
-- Cambia el correo por el administrador real.

update public.profiles
set role = 'admin'
where email = 'admin@tu-dominio.com';
