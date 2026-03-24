const bcrypt = require('bcryptjs');
const path = require('path');

// Configurar DB_PATH antes de importar connection
process.env.DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'database.sqlite');
const db = require('./connection');

const seed = () => {
    try {
        // Limpiar tablas
        db.exec('DELETE FROM register_categories');
        db.exec('DELETE FROM registers');
        db.exec('DELETE FROM categories');
        db.exec('DELETE FROM users');

        // Usuarios
        const salt = bcrypt.genSaltSync(10);
        const insertUser = db.prepare(`
            INSERT INTO users (name, username, password, role, created_at, updated_at)
            VALUES (@name, @username, @password, @role, datetime('now'), datetime('now'))
        `);

        insertUser.run({
            name: 'Administrator',
            username: 'admin',
            password: bcrypt.hashSync('admin', salt),
            role: 'admin',
        });

        insertUser.run({
            name: 'Jose',
            username: 'jose',
            password: bcrypt.hashSync('1234', salt),
            role: 'admin',
        });

        // Categorías
        const insertCategory = db.prepare(`
            INSERT INTO categories (name, description, default_track_stock, default_variable_price, created_at, updated_at)
            VALUES (@name, @description, @default_track_stock, @default_variable_price, datetime('now'), datetime('now'))
        `);

        insertCategory.run({ name: 'Recargas', description: 'Recargas de celular y servicios', default_track_stock: 0, default_variable_price: 1 });
        insertCategory.run({ name: 'Impresiones', description: 'Servicios de impresión', default_track_stock: 0, default_variable_price: 0 });
        insertCategory.run({ name: 'Nevera', description: 'Productos refrigerados', default_track_stock: 1, default_variable_price: 0 });
        insertCategory.run({ name: 'Otros', description: 'Otros productos', default_track_stock: 1, default_variable_price: 0 });

        // Cajas registradoras
        const insertRegister = db.prepare(`
            INSERT INTO registers (name, description, is_active, created_at, updated_at)
            VALUES (@name, @description, @is_active, datetime('now'), datetime('now'))
        `);

        const insertRegCat = db.prepare(`
            INSERT INTO register_categories (register_id, category_name) VALUES (@register_id, @category_name)
        `);

        const reg1 = insertRegister.run({ name: 'Caja 1 - Recargas', description: 'Caja exclusiva para recargas', is_active: 1 });
        insertRegCat.run({ register_id: reg1.lastInsertRowid, category_name: 'Recargas' });

        const reg2 = insertRegister.run({ name: 'Caja 2 - Tienda', description: 'Caja para productos de tienda', is_active: 1 });
        insertRegCat.run({ register_id: reg2.lastInsertRowid, category_name: 'Impresiones' });
        insertRegCat.run({ register_id: reg2.lastInsertRowid, category_name: 'Nevera' });
        insertRegCat.run({ register_id: reg2.lastInsertRowid, category_name: 'Otros' });

        // Settings por defecto
        const existing = db.prepare('SELECT id FROM settings LIMIT 1').get();
        if (!existing) {
            db.prepare(`INSERT INTO settings (store_name, store_logo, logo_size) VALUES ('POS Moderno', '', 80)`).run();
        }

        console.log('Data Imported!');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seed();
