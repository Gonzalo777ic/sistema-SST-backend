-- Script de limpieza de tablas de usuarios y trabajadores
-- IMPORTANTE: Este script mantiene solo al SUPER_ADMIN inicial del seeder
-- Ejecutar con precaución en producción

BEGIN;

-- 1. Guardar el DNI del SUPER_ADMIN antes de eliminar
DO $$
DECLARE
    admin_dni VARCHAR(8);
BEGIN
    -- Obtener el DNI del SUPER_ADMIN desde la variable de entorno o usar un valor por defecto
    -- En producción, asegúrate de que ADMIN_DNI esté configurado correctamente
    SELECT dni INTO admin_dni 
    FROM usuarios 
    WHERE 'SUPER_ADMIN' = ANY(roles) 
    AND activo = true 
    LIMIT 1;
    
    -- Si no se encuentra, usar el valor del .env (debe ser configurado manualmente)
    IF admin_dni IS NULL THEN
        RAISE EXCEPTION 'No se encontró un SUPER_ADMIN activo. Verifica la configuración.';
    END IF;
    
    -- 2. Eliminar usuarios que NO sean el SUPER_ADMIN
    DELETE FROM usuarios 
    WHERE dni != admin_dni 
    OR 'SUPER_ADMIN' != ALL(roles);
    
    -- 3. Eliminar todos los trabajadores (soft delete ya no aplica, eliminación física)
    DELETE FROM trabajadores;
    
    RAISE NOTICE 'Limpieza completada. SUPER_ADMIN con DNI % preservado.', admin_dni;
END $$;

COMMIT;

-- Verificación: Mostrar usuarios restantes
SELECT id, dni, roles, activo, created_at 
FROM usuarios 
ORDER BY created_at;
