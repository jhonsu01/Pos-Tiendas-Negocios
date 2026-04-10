import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// ─── Configuración ───────────────────────────────────────────────────────────
const POS_API_URL = process.env.POS_API_URL || "http://localhost:5000/api";
const POS_USERNAME = process.env.POS_USERNAME || "admin";
const POS_PASSWORD = process.env.POS_PASSWORD || "admin123";

let authToken = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function login() {
  const res = await fetch(`${POS_API_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: POS_USERNAME, password: POS_PASSWORD }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login fallido (${res.status}): ${text}`);
  }
  const data = await res.json();
  authToken = data.token;
  return authToken;
}

async function apiRequest(method, path, body = null) {
  if (!authToken) await login();

  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);

  let res = await fetch(`${POS_API_URL}${path}`, opts);

  // Si el token expiró, re-autenticar
  if (res.status === 401) {
    await login();
    opts.headers.Authorization = `Bearer ${authToken}`;
    res = await fetch(`${POS_API_URL}${path}`, opts);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API Error ${res.status}: ${text}`);
  }

  return res.json();
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── MCP Server ──────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "POS Tienda",
  version: "1.0.0",
  description: "Servidor MCP para gestionar ventas, productos e inventario del sistema POS",
});

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: Listar productos
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "listar_productos",
  "Lista todos los productos disponibles en el inventario con su precio, stock y categoría",
  {
    categoria: z.string().optional().describe("Filtrar por categoría (opcional)"),
  },
  async ({ categoria }) => {
    const productos = await apiRequest("GET", "/products");
    let lista = productos;

    if (categoria) {
      lista = lista.filter(
        (p) => p.category && p.category.toLowerCase().includes(categoria.toLowerCase())
      );
    }

    if (lista.length === 0) {
      return { content: [{ type: "text", text: "No se encontraron productos." }] };
    }

    const texto = lista
      .map(
        (p) =>
          `• [ID:${p._id}] ${p.emoji || ""} ${p.name} — ${formatCurrency(p.price)} | Stock: ${p.trackStock ? p.stock : "N/A"} | Categoría: ${p.category || "Sin categoría"}`
      )
      .join("\n");

    return {
      content: [{ type: "text", text: `📦 **Productos (${lista.length}):**\n\n${texto}` }],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: Buscar producto
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "buscar_producto",
  "Busca un producto por nombre o SKU",
  {
    busqueda: z.string().describe("Nombre o SKU del producto a buscar"),
  },
  async ({ busqueda }) => {
    const productos = await apiRequest("GET", "/products");
    const termino = busqueda.toLowerCase();

    const resultados = productos.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(termino)) ||
        (p.sku && p.sku.toLowerCase().includes(termino))
    );

    if (resultados.length === 0) {
      return { content: [{ type: "text", text: `No se encontró ningún producto con "${busqueda}".` }] };
    }

    const texto = resultados
      .map(
        (p) =>
          `• [ID:${p._id}] ${p.emoji || ""} ${p.name}\n  SKU: ${p.sku || "N/A"} | Precio: ${formatCurrency(p.price)} | Stock: ${p.trackStock ? p.stock : "N/A"} | Categoría: ${p.category || "Sin categoría"} | Precio variable: ${p.variablePrice ? "Sí" : "No"}`
      )
      .join("\n\n");

    return {
      content: [{ type: "text", text: `🔍 **Resultados (${resultados.length}):**\n\n${texto}` }],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: Crear venta
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "crear_venta",
  "Registra una nueva venta en el sistema POS. Descuenta automáticamente el stock de los productos.",
  {
    items: z
      .array(
        z.object({
          product: z.number().nullable().optional().describe("ID del producto (opcional)"),
          name: z.string().describe("Nombre del producto"),
          qty: z.number().min(1).describe("Cantidad vendida"),
          price: z.number().min(0).describe("Precio unitario"),
          category: z.string().optional().describe("Categoría del producto (opcional)"),
        })
      )
      .min(1)
      .describe("Lista de productos vendidos"),
    totalAmount: z.number().min(0).describe("Monto total de la venta"),
    paymentMethod: z
      .string()
      .default("Cash")
      .optional()
      .describe("Método de pago (default: Cash)"),
    register: z.number().nullable().optional().describe("ID de la caja registradora (opcional)"),
  },
  async ({ items, totalAmount, paymentMethod, register }) => {
    const body = {
      items,
      totalAmount,
      paymentMethod: paymentMethod || "Cash",
    };
    if (register) body.register = register;

    const venta = await apiRequest("POST", "/sales", body);

    const itemsTexto = venta.items
      .map((i) => `  • ${i.name} x${i.qty} — ${formatCurrency(i.price * i.qty)}`)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `✅ **Venta registrada exitosamente**\n\n🆔 ID: ${venta._id}\n📅 Fecha: ${new Date(venta.createdAt).toLocaleString("es-CO")}\n💰 Total: ${formatCurrency(venta.totalAmount)}\n💳 Pago: ${venta.paymentMethod}\n\n📋 Items:\n${itemsTexto}`,
        },
      ],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: Ver historial de ventas
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "historial_ventas",
  "Consulta el historial de ventas registradas en el sistema",
  {
    limite: z.number().default(10).optional().describe("Cantidad máxima de ventas a mostrar (default: 10)"),
  },
  async ({ limite }) => {
    const ventas = await apiRequest("GET", "/sales");
    const lista = ventas.slice(0, limite || 10);

    if (lista.length === 0) {
      return { content: [{ type: "text", text: "No hay ventas registradas." }] };
    }

    const texto = lista
      .map((v) => {
        const items = v.items.map((i) => `    • ${i.name} x${i.qty}`).join("\n");
        return `🧾 [ID:${v._id}] ${new Date(v.createdAt).toLocaleString("es-CO")} — ${formatCurrency(v.totalAmount)} (${v.paymentMethod})\n${items}`;
      })
      .join("\n\n");

    return {
      content: [
        {
          type: "text",
          text: `📊 **Últimas ${lista.length} ventas:**\n\n${texto}`,
        },
      ],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: Ver detalle de venta
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "detalle_venta",
  "Obtiene el detalle completo de una venta específica por su ID",
  {
    id: z.number().describe("ID de la venta"),
  },
  async ({ id }) => {
    const venta = await apiRequest("GET", `/sales/${id}`);

    const items = venta.items
      .map(
        (i) =>
          `  • ${i.name} x${i.qty} @ ${formatCurrency(i.price)} = ${formatCurrency(i.price * i.qty)}`
      )
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `🧾 **Detalle de Venta #${venta._id}**\n\n📅 Fecha: ${new Date(venta.createdAt).toLocaleString("es-CO")}\n👤 Vendedor: ${venta.user?.name || "N/A"}\n💳 Pago: ${venta.paymentMethod}\n🏪 Caja: ${venta.register || "Sin asignar"}\n\n📋 Items:\n${items}\n\n💰 **Total: ${formatCurrency(venta.totalAmount)}**`,
        },
      ],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: Eliminar venta
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "eliminar_venta",
  "Elimina una venta del sistema y restaura el stock de los productos",
  {
    id: z.number().describe("ID de la venta a eliminar"),
  },
  async ({ id }) => {
    await apiRequest("DELETE", `/sales/${id}`);
    return {
      content: [
        {
          type: "text",
          text: `🗑️ Venta #${id} eliminada exitosamente. El stock de los productos ha sido restaurado.`,
        },
      ],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: Listar categorías
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "listar_categorias",
  "Lista todas las categorías de productos disponibles",
  {},
  async () => {
    const categorias = await apiRequest("GET", "/categories");

    if (categorias.length === 0) {
      return { content: [{ type: "text", text: "No hay categorías registradas." }] };
    }

    const texto = categorias
      .map(
        (c) =>
          `• [ID:${c._id}] ${c.name} ${c.isActive ? "✅" : "❌"} — ${c.description || "Sin descripción"}`
      )
      .join("\n");

    return {
      content: [{ type: "text", text: `🏷️ **Categorías (${categorias.length}):**\n\n${texto}` }],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: Listar cajas registradoras
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "listar_cajas",
  "Lista todas las cajas registradoras del sistema",
  {},
  async () => {
    const registros = await apiRequest("GET", "/registers");

    if (registros.length === 0) {
      return { content: [{ type: "text", text: "No hay cajas registradoras configuradas." }] };
    }

    const texto = registros
      .map(
        (r) =>
          `• [ID:${r._id}] ${r.name} ${r.isActive ? "✅" : "❌"} — ${r.description || ""} | Categorías: ${r.categories?.join(", ") || "Todas"}`
      )
      .join("\n");

    return {
      content: [{ type: "text", text: `🏪 **Cajas registradoras (${registros.length}):**\n\n${texto}` }],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: Resumen de caja
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "resumen_caja",
  "Obtiene el resumen de ventas de una caja registradora específica",
  {
    id: z.number().describe("ID de la caja registradora"),
  },
  async ({ id }) => {
    const resumen = await apiRequest("GET", `/registers/${id}/summary`);

    return {
      content: [
        {
          type: "text",
          text: `🏪 **Resumen de Caja #${id}**\n\n💰 Total ventas: ${formatCurrency(resumen.totalSales || 0)}\n🧾 Cantidad de ventas: ${resumen.salesCount || 0}\n💵 Efectivo: ${formatCurrency(resumen.cashTotal || 0)}\n📋 Transferencias: ${formatCurrency(resumen.transferTotal || 0)}`,
        },
      ],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: Cerrar caja
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "cerrar_caja",
  "Realiza el cierre de caja de una caja registradora",
  {
    id: z.number().describe("ID de la caja registradora"),
    openingBalance: z.number().describe("Saldo de apertura"),
    closingBalance: z.number().describe("Saldo de cierre"),
    notes: z.string().optional().describe("Notas del cierre (opcional)"),
  },
  async ({ id, openingBalance, closingBalance, notes }) => {
    const body = { openingBalance, closingBalance };
    if (notes) body.notes = notes;

    const cierre = await apiRequest("POST", `/registers/${id}/close`, body);

    return {
      content: [
        {
          type: "text",
          text: `✅ **Cierre de caja realizado**\n\n🏪 Caja: #${id}\n💵 Apertura: ${formatCurrency(openingBalance)}\n💰 Cierre: ${formatCurrency(closingBalance)}\n📊 Ventas totales: ${formatCurrency(cierre.totalSales || 0)}\n🧾 Cantidad: ${cierre.salesCount || 0} ventas\n${notes ? `📝 Notas: ${notes}` : ""}`,
        },
      ],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: Resumen del día
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "resumen_dia",
  "Genera un resumen de todas las ventas del día actual con totales y estadísticas",
  {},
  async () => {
    const ventas = await apiRequest("GET", "/sales");
    const hoy = new Date().toISOString().split("T")[0];

    const ventasHoy = ventas.filter(
      (v) => v.createdAt && v.createdAt.startsWith(hoy)
    );

    if (ventasHoy.length === 0) {
      return { content: [{ type: "text", text: "📊 No hay ventas registradas el día de hoy." }] };
    }

    const totalDia = ventasHoy.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
    const efectivo = ventasHoy
      .filter((v) => v.paymentMethod === "Cash")
      .reduce((sum, v) => sum + (v.totalAmount || 0), 0);
    const otros = totalDia - efectivo;

    // Productos más vendidos
    const productosMap = {};
    for (const v of ventasHoy) {
      for (const item of v.items || []) {
        const key = item.name;
        if (!productosMap[key]) productosMap[key] = { name: key, qty: 0, total: 0 };
        productosMap[key].qty += item.qty;
        productosMap[key].total += item.qty * item.price;
      }
    }
    const topProductos = Object.values(productosMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const topTexto = topProductos
      .map((p) => `  • ${p.name}: ${p.qty} unidades — ${formatCurrency(p.total)}`)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: `📊 **Resumen del día (${hoy})**\n\n🧾 Ventas realizadas: ${ventasHoy.length}\n💰 Total del día: ${formatCurrency(totalDia)}\n💵 Efectivo: ${formatCurrency(efectivo)}\n💳 Otros métodos: ${formatCurrency(otros)}\n\n🏆 **Top 5 productos más vendidos:**\n${topTexto || "  Sin datos"}`,
        },
      ],
    };
  }
);

// ═══════════════════════════════════════════════════════════════════════════════
// TOOL: Actualizar stock de producto
// ═══════════════════════════════════════════════════════════════════════════════
server.tool(
  "actualizar_stock",
  "Actualiza el stock de un producto. Permite establecer un valor exacto o sumar/restar unidades al stock actual.",
  {
    producto_id: z.number().describe("ID del producto a actualizar"),
    cantidad: z.number().describe("Cantidad de stock. Si modo es 'establecer', se fija este valor. Si es 'sumar', se añade al stock actual. Si es 'restar', se descuenta del stock actual."),
    modo: z
      .enum(["establecer", "sumar", "restar"])
      .default("sumar")
      .describe("Modo de actualización: 'establecer' fija el stock, 'sumar' añade unidades, 'restar' descuenta unidades (default: sumar)"),
  },
  async ({ producto_id, cantidad, modo }) => {
    // Obtener producto actual
    const producto = await apiRequest("GET", `/products/${producto_id}`);

    if (!producto) {
      return { content: [{ type: "text", text: `❌ No se encontró el producto con ID ${producto_id}.` }] };
    }

    let nuevoStock;
    const stockAnterior = producto.stock || 0;

    switch (modo) {
      case "establecer":
        nuevoStock = cantidad;
        break;
      case "sumar":
        nuevoStock = stockAnterior + cantidad;
        break;
      case "restar":
        nuevoStock = stockAnterior - cantidad;
        if (nuevoStock < 0) {
          return {
            content: [
              {
                type: "text",
                text: `⚠️ No se puede restar ${cantidad} unidades. El stock actual de "${producto.name}" es ${stockAnterior}. El stock no puede quedar negativo.`,
              },
            ],
          };
        }
        break;
    }

    await apiRequest("PUT", `/products/${producto_id}`, {
      name: producto.name,
      price: producto.price,
      stock: nuevoStock,
      category: producto.category,
      trackStock: producto.trackStock,
      variablePrice: producto.variablePrice,
      emoji: producto.emoji,
    });

    const accion = modo === "establecer" ? "establecido en" : modo === "sumar" ? `aumentado en +${cantidad} →` : `reducido en -${cantidad} →`;

    return {
      content: [
        {
          type: "text",
          text: `✅ **Stock actualizado**\n\n📦 Producto: ${producto.emoji || ""} ${producto.name} [ID:${producto_id}]\n📊 Stock anterior: ${stockAnterior}\n📊 Stock nuevo: ${nuevoStock}\n🔄 Acción: ${accion} ${nuevoStock} unidades`,
        },
      ],
    };
  }
);

// ─── Iniciar servidor ────────────────────────────────────────────────────────
const transport = new StdioServerTransport();
await server.connect(transport);
