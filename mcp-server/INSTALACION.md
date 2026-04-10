# MCP Server - POS Tienda

Servidor MCP (Model Context Protocol) para gestionar tu sistema POS directamente desde Claude Desktop.

## Requisitos previos

- **Node.js** v18 o superior instalado
- **Sistema POS** corriendo en `http://localhost:5000` (backend iniciado)
- **Claude Desktop** instalado

## Instalacion

### 1. Instalar dependencias

Abre una terminal en la carpeta del MCP server y ejecuta:

```bash
cd E:\ejemplo\Pos-Tiendas-Negocios\mcp-server
npm install
```

### 2. Configurar Claude Desktop

Abre el archivo de configuracion de Claude Desktop:

```
%APPDATA%\Claude\claude_desktop_config.json
```

> Puedes abrirlo rapido con: `Win + R` y pegar la ruta anterior, o navegar a:
> `C:\Users\TU_USUARIO\AppData\Roaming\Claude\claude_desktop_config.json`

Agrega la siguiente configuracion (o fusiona con la existente):

```json
{
  "mcpServers": {
    "pos-tienda": {
      "command": "node",
      "args": ["E:\\ejemplo\\Pos-Tiendas-Negocios\\mcp-server\\index.js"],
      "env": {
        "POS_API_URL": "http://localhost:5000/api",
        "POS_USERNAME": "admin",
        "POS_PASSWORD": "admin123"
      }
    }
  }
}
```

> **IMPORTANTE:** Si ya tienes otros MCP servers configurados, solo agrega la clave `"pos-tienda"` dentro del objeto `mcpServers` existente.

### 3. Variables de entorno

| Variable | Descripcion | Valor por defecto |
|---|---|---|
| `POS_API_URL` | URL base de la API del POS | `http://localhost:5000/api` |
| `POS_USERNAME` | Usuario para autenticacion | `admin` |
| `POS_PASSWORD` | Contrasena del usuario | `admin123` |

> Cambia `POS_USERNAME` y `POS_PASSWORD` por las credenciales de tu usuario administrador.

### 4. Reiniciar Claude Desktop

Cierra completamente Claude Desktop y vuelvelo a abrir para que cargue el nuevo MCP server.

## Herramientas disponibles

Una vez configurado, puedes pedirle a Claude que realice estas acciones:

| Herramienta | Descripcion |
|---|---|
| `listar_productos` | Lista todos los productos con precio, stock y categoria |
| `buscar_producto` | Busca productos por nombre o SKU |
| `crear_venta` | Registra una nueva venta (descuenta stock automaticamente) |
| `historial_ventas` | Consulta las ultimas ventas realizadas |
| `detalle_venta` | Ver detalle completo de una venta por ID |
| `eliminar_venta` | Elimina una venta y restaura el stock |
| `listar_categorias` | Lista todas las categorias de productos |
| `listar_cajas` | Lista las cajas registradoras |
| `resumen_caja` | Resumen de ventas de una caja especifica |
| `cerrar_caja` | Realiza el cierre de caja |
| `resumen_dia` | Resumen completo de ventas del dia |

## Ejemplos de uso en Claude

Puedes hablarle a Claude de forma natural:

- *"Muestrame los productos disponibles"*
- *"Busca el producto arroz"*
- *"Registra una venta de 2 coca-colas a $2500 cada una y 1 pan a $1000"*
- *"Dame el resumen de ventas de hoy"*
- *"Cual es el historial de las ultimas 5 ventas?"*
- *"Cierra la caja 1 con apertura de $50000 y cierre de $350000"*
- *"Elimina la venta #15"*

## Solucion de problemas

### El MCP no aparece en Claude Desktop
1. Verifica que la ruta en `args` sea correcta y use doble backslash (`\\`)
2. Asegurate de que Node.js este en el PATH del sistema
3. Reinicia Claude Desktop completamente

### Error de conexion
1. Verifica que el backend del POS este corriendo: `http://localhost:5000`
2. Ejecuta `INICIAR.bat` en la raiz del proyecto POS para iniciar el backend

### Error de autenticacion
1. Verifica que las credenciales en `env` sean correctas
2. Asegurate de que el usuario exista y tenga rol de administrador

### Probar manualmente
Puedes probar que el MCP funciona ejecutando:

```bash
cd E:\ejemplo\Pos-Tiendas-Negocios\mcp-server
node index.js
```

Si no muestra errores y queda esperando input, esta funcionando correctamente (usa Ctrl+C para salir).
