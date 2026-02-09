# Scripts de Mantenimiento

## Limpieza de Usuarios y Trabajadores

Este script elimina todos los usuarios y trabajadores de la base de datos, manteniendo únicamente al SUPER_ADMIN inicial creado por el seeder.

### ⚠️ ADVERTENCIA

**Este script elimina datos permanentemente. Úsalo solo en entornos de desarrollo o cuando necesites resetear completamente la base de datos.**

### Requisitos

1. Asegúrate de que la variable `ADMIN_DNI` esté configurada en tu archivo `.env`
2. El SUPER_ADMIN debe existir en la base de datos (creado por el seeder)

### Uso

#### Opción 1: Script TypeScript (Recomendado)

```bash
npm run cleanup:users-trabajadores
```

O directamente:

```bash
ts-node -r tsconfig-paths/register scripts/cleanup-users-trabajadores.ts
```

#### Opción 2: Script SQL

```bash
psql -U postgres -d sst_db -f scripts/cleanup-users-trabajadores.sql
```

### Qué hace el script

1. **Identifica al SUPER_ADMIN**: Busca el usuario con rol `SUPER_ADMIN` usando el DNI configurado en `ADMIN_DNI`
2. **Elimina otros usuarios**: Elimina todos los usuarios excepto el SUPER_ADMIN
3. **Elimina trabajadores**: Elimina todos los registros de trabajadores
4. **Muestra resultados**: Lista los usuarios restantes para verificación

### Verificación

Después de ejecutar el script, deberías ver solo un usuario en la base de datos:

```
📋 Usuarios restantes:
  - DNI: [ADMIN_DNI], Roles: SUPER_ADMIN, Activo: true
```

### Troubleshooting

- **Error: "ADMIN_DNI no está configurado"**: Verifica que `ADMIN_DNI` esté en tu archivo `.env`
- **Error: "No se encontró un SUPER_ADMIN"**: Ejecuta el seeder primero o crea manualmente el SUPER_ADMIN
- **Error de conexión**: Verifica las credenciales de la base de datos en `.env`
