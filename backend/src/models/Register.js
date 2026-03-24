const db = require('../../database/connection');

class Register {
    static findAll() {
        const rows = db.prepare('SELECT * FROM registers').all();
        return rows.map(Register._formatRow);
    }

    static findActive() {
        const rows = db.prepare('SELECT * FROM registers WHERE is_active = 1').all();
        return rows.map(Register._formatRow);
    }

    static findById(id) {
        const row = db.prepare('SELECT * FROM registers WHERE id = ?').get(id);
        return row ? Register._formatRow(row) : null;
    }

    static findOne(query) {
        if (query.user && query.status) {
            // Not directly applicable to SQLite schema - return null
            return null;
        }
        const row = db.prepare('SELECT * FROM registers WHERE is_active = 1 LIMIT 1').get();
        return row ? Register._formatRow(row) : null;
    }

    static create(data) {
        const stmt = db.prepare(`
            INSERT INTO registers (name, description, is_active, created_at, updated_at)
            VALUES (@name, @description, @is_active, datetime('now'), datetime('now'))
        `);

        const result = stmt.run({
            name: data.name,
            description: data.description || null,
            is_active: data.isActive !== undefined ? (data.isActive ? 1 : 0) : 1,
        });

        const registerId = result.lastInsertRowid;

        // Insert categories
        if (data.categories && data.categories.length > 0) {
            const insertCat = db.prepare('INSERT INTO register_categories (register_id, category_name) VALUES (?, ?)');
            for (const cat of data.categories) {
                insertCat.run(registerId, cat);
            }
        }

        return Register.findById(registerId);
    }

    static update(id, data) {
        const reg = Register.findById(id);
        if (!reg) return null;

        db.prepare(`
            UPDATE registers SET
                name = @name, description = @description, is_active = @is_active,
                updated_at = datetime('now')
            WHERE id = @id
        `).run({
            id,
            name: data.name !== undefined ? data.name : reg.name,
            description: data.description !== undefined ? data.description : reg.description,
            is_active: data.isActive !== undefined ? (data.isActive ? 1 : 0) : (reg.isActive ? 1 : 0),
        });

        // Update categories if provided
        if (data.categories !== undefined) {
            db.prepare('DELETE FROM register_categories WHERE register_id = ?').run(id);
            const insertCat = db.prepare('INSERT INTO register_categories (register_id, category_name) VALUES (?, ?)');
            for (const cat of data.categories) {
                insertCat.run(id, cat);
            }
        }

        return Register.findById(id);
    }

    static deleteById(id) {
        db.prepare('DELETE FROM register_categories WHERE register_id = ?').run(id);
        return db.prepare('DELETE FROM registers WHERE id = ?').run(id);
    }

    static _formatRow(row) {
        // Get categories for this register
        const cats = db.prepare('SELECT category_name FROM register_categories WHERE register_id = ?').all(row.id);

        return {
            _id: row.id,
            id: row.id,
            name: row.name,
            description: row.description,
            categories: cats.map(c => c.category_name),
            isActive: !!row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}

module.exports = Register;
