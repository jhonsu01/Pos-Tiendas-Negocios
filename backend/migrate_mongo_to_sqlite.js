/**
 * HERRAMIENTA DE MIGRACION: MongoDB JSON Backup → SQLite
 *
 * USO:
 *   node migrate_mongo_to_sqlite.js <ruta-al-data.json>
 *
 * EJEMPLO:
 *   node migrate_mongo_to_sqlite.js backups/backup_2025-12-05T04-18-43-369Z/data.json
 *
 * NOTA: Esta herramienta lee un archivo data.json generado por el sistema
 *       de backups anterior (MongoDB) y migra todos los datos a SQLite.
 *       Los passwords se preservan tal cual (ya estan hasheados con bcrypt).
 *       Los ObjectId de MongoDB se mapean a IDs enteros de SQLite.
 */

const fs = require('fs');
const path = require('path');

// Inicializar SQLite
const dbPath = process.env.DB_PATH || path.join(__dirname, 'data', 'database.sqlite');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

// Borrar BD existente si hay para empezar limpio
if (fs.existsSync(dbPath)) {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    rl.question(`\n  ADVERTENCIA: Ya existe una base de datos en:\n  ${dbPath}\n\n  Se eliminara y reemplazara con los datos importados.\n  Continuar? (s/n): `, (answer) => {
        rl.close();
        if (answer.toLowerCase() !== 's') {
            console.log('  Cancelado.\n');
            process.exit(0);
        }
        fs.unlinkSync(dbPath);
        runMigration();
    });
} else {
    runMigration();
}

function runMigration() {
    const db = require('./database/connection');

    // Leer archivo de entrada
    const inputFile = process.argv[2];
    if (!inputFile) {
        console.error('\n  USO: node migrate_mongo_to_sqlite.js <ruta-al-data.json>\n');
        console.error('  Backups disponibles:');
        const backupDir = path.join(__dirname, 'backups');
        if (fs.existsSync(backupDir)) {
            const dirs = fs.readdirSync(backupDir).filter(f => {
                const metaPath = path.join(backupDir, f, 'metadata.json');
                return fs.existsSync(metaPath);
            });
            dirs.forEach(d => {
                const meta = JSON.parse(fs.readFileSync(path.join(backupDir, d, 'metadata.json'), 'utf8'));
                console.error(`    node migrate_mongo_to_sqlite.js backups/${d}/data.json  (${meta.description} - ${meta.totalDocuments} docs)`);
            });
        }
        console.error('');
        process.exit(1);
    }

    const fullPath = path.resolve(__dirname, inputFile);
    if (!fs.existsSync(fullPath)) {
        console.error(`\n  [ERROR] Archivo no encontrado: ${fullPath}\n`);
        process.exit(1);
    }

    console.log(`\n  Leyendo: ${fullPath}`);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

    // Mapa de ObjectId MongoDB → ID SQLite
    const idMap = {};

    const mapId = (mongoId) => idMap[mongoId] || null;

    // Helper para fechas
    const toDateStr = (val) => {
        if (!val) return null;
        if (typeof val === 'string') return val;
        if (val.$date) return val.$date;
        return new Date(val).toISOString();
    };

    // ============================================
    // MIGRAR USUARIOS (primero porque otros referencian)
    // ============================================
    const users = data.users || [];
    console.log(`  Migrando ${users.length} usuarios...`);

    const insertUser = db.prepare(`
        INSERT INTO users (name, username, password, role, license_expires_at, created_at, updated_at)
        VALUES (@name, @username, @password, @role, @license_expires_at, @created_at, @updated_at)
    `);

    for (const u of users) {
        const result = insertUser.run({
            name: u.name,
            username: u.username,
            password: u.password, // Preservar hash bcrypt original
            role: u.role || 'cashier',
            license_expires_at: toDateStr(u.licenseExpiresAt),
            created_at: toDateStr(u.createdAt) || new Date().toISOString(),
            updated_at: toDateStr(u.updatedAt) || new Date().toISOString(),
        });
        idMap[u._id] = result.lastInsertRowid;
    }

    // ============================================
    // MIGRAR CATEGORIAS
    // ============================================
    const categories = data.categories || [];
    console.log(`  Migrando ${categories.length} categorias...`);

    const insertCategory = db.prepare(`
        INSERT INTO categories (name, description, default_track_stock, default_variable_price, is_active, created_at, updated_at)
        VALUES (@name, @description, @default_track_stock, @default_variable_price, @is_active, @created_at, @updated_at)
    `);

    for (const c of categories) {
        const result = insertCategory.run({
            name: c.name,
            description: c.description || null,
            default_track_stock: c.defaultTrackStock ? 1 : 0,
            default_variable_price: c.defaultVariablePrice ? 1 : 0,
            is_active: c.isActive !== false ? 1 : 0,
            created_at: toDateStr(c.createdAt) || new Date().toISOString(),
            updated_at: toDateStr(c.updatedAt) || new Date().toISOString(),
        });
        idMap[c._id] = result.lastInsertRowid;
    }

    // ============================================
    // MIGRAR PRODUCTOS
    // ============================================
    const products = data.products || [];
    console.log(`  Migrando ${products.length} productos...`);

    const insertProduct = db.prepare(`
        INSERT INTO products (name, sku, price, stock, category, track_stock, variable_price, image, emoji, position, created_at, updated_at)
        VALUES (@name, @sku, @price, @stock, @category, @track_stock, @variable_price, @image, @emoji, @position, @created_at, @updated_at)
    `);

    for (const p of products) {
        const result = insertProduct.run({
            name: p.name,
            sku: p.sku || null,
            price: p.price || 0,
            stock: p.stock || 0,
            category: p.category,
            track_stock: p.trackStock !== false ? 1 : 0,
            variable_price: p.variablePrice ? 1 : 0,
            image: p.image || null,
            emoji: p.emoji || null,
            position: p.position || 0,
            created_at: toDateStr(p.createdAt) || new Date().toISOString(),
            updated_at: toDateStr(p.updatedAt) || new Date().toISOString(),
        });
        idMap[p._id] = result.lastInsertRowid;
    }

    // ============================================
    // MIGRAR PROVEEDORES
    // ============================================
    const suppliers = data.suppliers || [];
    console.log(`  Migrando ${suppliers.length} proveedores...`);

    const insertSupplier = db.prepare(`
        INSERT INTO suppliers (name, contact, phone, email, address, notes, is_active, created_at, updated_at)
        VALUES (@name, @contact, @phone, @email, @address, @notes, @is_active, @created_at, @updated_at)
    `);

    for (const s of suppliers) {
        const result = insertSupplier.run({
            name: s.name,
            contact: s.contact || null,
            phone: s.phone || null,
            email: s.email || null,
            address: s.address || null,
            notes: s.notes || null,
            is_active: s.isActive !== false ? 1 : 0,
            created_at: toDateStr(s.createdAt) || new Date().toISOString(),
            updated_at: toDateStr(s.updatedAt) || new Date().toISOString(),
        });
        idMap[s._id] = result.lastInsertRowid;
    }

    // ============================================
    // MIGRAR CAJAS REGISTRADORAS
    // ============================================
    const registers = data.registers || [];
    console.log(`  Migrando ${registers.length} cajas registradoras...`);

    const insertRegister = db.prepare(`
        INSERT INTO registers (name, description, is_active, created_at, updated_at)
        VALUES (@name, @description, @is_active, @created_at, @updated_at)
    `);
    const insertRegCat = db.prepare(`
        INSERT INTO register_categories (register_id, category_name) VALUES (?, ?)
    `);

    for (const r of registers) {
        const result = insertRegister.run({
            name: r.name,
            description: r.description || null,
            is_active: r.isActive !== false ? 1 : 0,
            created_at: toDateStr(r.createdAt) || new Date().toISOString(),
            updated_at: toDateStr(r.updatedAt) || new Date().toISOString(),
        });
        idMap[r._id] = result.lastInsertRowid;

        if (r.categories && r.categories.length > 0) {
            for (const cat of r.categories) {
                insertRegCat.run(result.lastInsertRowid, cat);
            }
        }
    }

    // ============================================
    // MIGRAR VENTAS
    // ============================================
    const sales = data.sales || [];
    console.log(`  Migrando ${sales.length} ventas...`);

    const insertSale = db.prepare(`
        INSERT INTO sales (register_id, user_id, total_amount, payment_method, is_transfer_payment, created_at, updated_at)
        VALUES (@register_id, @user_id, @total_amount, @payment_method, @is_transfer_payment, @created_at, @updated_at)
    `);
    const insertSaleItem = db.prepare(`
        INSERT INTO sale_items (sale_id, product_id, name, qty, price, category)
        VALUES (@sale_id, @product_id, @name, @qty, @price, @category)
    `);

    for (const s of sales) {
        const result = insertSale.run({
            register_id: mapId(s.register),
            user_id: mapId(s.user),
            total_amount: s.totalAmount,
            payment_method: s.paymentMethod || 'Cash',
            is_transfer_payment: s.isTransferPayment ? 1 : 0,
            created_at: toDateStr(s.createdAt) || new Date().toISOString(),
            updated_at: toDateStr(s.updatedAt) || new Date().toISOString(),
        });
        idMap[s._id] = result.lastInsertRowid;

        if (s.items && s.items.length > 0) {
            for (const item of s.items) {
                insertSaleItem.run({
                    sale_id: result.lastInsertRowid,
                    product_id: mapId(item.product),
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                    category: item.category || null,
                });
            }
        }
    }

    // ============================================
    // MIGRAR CIERRES DE CAJA
    // ============================================
    const closures = data.cashclosures || [];
    console.log(`  Migrando ${closures.length} cierres de caja...`);

    const insertClosure = db.prepare(`
        INSERT INTO cash_closures (register_id, user_id, opening_balance, closing_balance, total_sales, sales_count, notes, closed_at, created_at, updated_at)
        VALUES (@register_id, @user_id, @opening_balance, @closing_balance, @total_sales, @sales_count, @notes, @closed_at, @created_at, @updated_at)
    `);

    for (const c of closures) {
        const result = insertClosure.run({
            register_id: mapId(c.register),
            user_id: mapId(c.user),
            opening_balance: c.openingBalance || 0,
            closing_balance: c.closingBalance,
            total_sales: c.totalSales,
            sales_count: c.salesCount,
            notes: c.notes || null,
            closed_at: toDateStr(c.closedAt),
            created_at: toDateStr(c.createdAt) || new Date().toISOString(),
            updated_at: toDateStr(c.updatedAt) || new Date().toISOString(),
        });
        idMap[c._id] = result.lastInsertRowid;
    }

    // ============================================
    // MIGRAR TRANSFERENCIAS (DEUDAS)
    // ============================================
    const transfers = data.transfers || [];
    console.log(`  Migrando ${transfers.length} transferencias...`);

    const insertTransfer = db.prepare(`
        INSERT INTO transfers (customer_name, user_id, total_amount, status, paid_at, created_at, updated_at)
        VALUES (@customer_name, @user_id, @total_amount, @status, @paid_at, @created_at, @updated_at)
    `);
    const insertTransferItem = db.prepare(`
        INSERT INTO transfer_items (transfer_id, product_id, name, qty, price, category)
        VALUES (@transfer_id, @product_id, @name, @qty, @price, @category)
    `);

    for (const t of transfers) {
        const result = insertTransfer.run({
            customer_name: t.customerName,
            user_id: mapId(t.user),
            total_amount: t.totalAmount || 0,
            status: t.status || 'pending',
            paid_at: toDateStr(t.paidAt),
            created_at: toDateStr(t.createdAt) || new Date().toISOString(),
            updated_at: toDateStr(t.updatedAt) || new Date().toISOString(),
        });
        idMap[t._id] = result.lastInsertRowid;

        if (t.items && t.items.length > 0) {
            for (const item of t.items) {
                insertTransferItem.run({
                    transfer_id: result.lastInsertRowid,
                    product_id: mapId(item.product),
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                    category: item.category || null,
                });
            }
        }
    }

    // ============================================
    // MIGRAR PAGOS A PROVEEDORES
    // ============================================
    const payments = data.supplierpayments || [];
    console.log(`  Migrando ${payments.length} pagos a proveedores...`);

    const insertPayment = db.prepare(`
        INSERT INTO supplier_payments (supplier_id, register_id, user_id, amount, description, payment_date, created_at, updated_at)
        VALUES (@supplier_id, @register_id, @user_id, @amount, @description, @payment_date, @created_at, @updated_at)
    `);

    for (const p of payments) {
        insertPayment.run({
            supplier_id: mapId(p.supplier),
            register_id: mapId(p.register),
            user_id: mapId(p.user),
            amount: p.amount,
            description: p.description || null,
            payment_date: toDateStr(p.paymentDate) || new Date().toISOString(),
            created_at: toDateStr(p.createdAt) || new Date().toISOString(),
            updated_at: toDateStr(p.updatedAt) || new Date().toISOString(),
        });
    }

    // ============================================
    // MIGRAR SETTINGS
    // ============================================
    const settings = data.settings || [];
    if (settings.length > 0) {
        console.log('  Migrando configuracion...');
        const s = settings[0];
        db.prepare(`
            INSERT INTO settings (store_name, store_logo, logo_size, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            s.storeName || 'POS Moderno',
            s.storeLogo || '',
            s.logoSize || 80,
            toDateStr(s.createdAt) || new Date().toISOString(),
            toDateStr(s.updatedAt) || new Date().toISOString()
        );
    }

    // ============================================
    // RESUMEN
    // ============================================
    console.log('\n  ========================================');
    console.log('    MIGRACION COMPLETADA');
    console.log('  ========================================');
    console.log(`    Usuarios:        ${users.length}`);
    console.log(`    Categorias:      ${categories.length}`);
    console.log(`    Productos:       ${products.length}`);
    console.log(`    Proveedores:     ${suppliers.length}`);
    console.log(`    Cajas:           ${registers.length}`);
    console.log(`    Ventas:          ${sales.length}`);
    console.log(`    Cierres caja:    ${closures.length}`);
    console.log(`    Transferencias:  ${transfers.length}`);
    console.log(`    Pagos proveedor: ${payments.length}`);
    console.log(`    Settings:        ${settings.length > 0 ? 1 : 0}`);
    console.log(`\n    BD SQLite: ${dbPath}`);
    console.log('  ========================================\n');

    process.exit(0);
}
