# Changelog

## [3.0.0] - 2026-03-23

### Migracion

- Migrado de MongoDB/Mongoose a SQLite (better-sqlite3)
- Base de datos embebida, sin necesidad de servidor externo
- Esquema relacional completo con foreign keys e indices

### Cambios

- Eliminada dependencia de MongoDB y Mongoose
- Nuevos modelos SQLite con patron repositorio estatico
- Controladores migrados de async/await a sincrono (better-sqlite3)
- Sistema de backup migrado: ahora copia el archivo SQLite directamente
- Subdocumentos embebidos (Sale.items, Transfer.items) normalizados a tablas separadas
- Array de categorias de Register normalizado a tabla pivote (register_categories)
- Esquema auto-inicializable al primer arranque

### Beneficios

- Instalacion mas simple (sin MongoDB)
- Menor consumo de recursos (sin servidor de BD separado)
- Backup simple (copiar un archivo)
- Portabilidad total
- Arranque mas rapido
- Sin dependencias externas de base de datos

### Notas de migracion

- Los IDs ahora son enteros auto-incrementales (antes eran ObjectId de MongoDB)
- La API mantiene compatibilidad exponiendo `_id` como alias de `id`
- El frontend no requiere cambios
- Los datos existentes en MongoDB no se migran automaticamente
