const db = require('../../database/connection');

class Category {
    static findActive() {
        const rows = db.prepare('SELECT * FROM categories WHERE is_active = 1').all();
        return rows.map(Category._formatRow);
    }

    static findAll() {
        const rows = db.prepare('SELECT * FROM categories').all();
        return rows.map(Category._formatRow);
    }

    static findById(id) {
        const row = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
        return row ? Category._formatRow(row) : null;
    }

    static findOne(query) {
        if (query.name) {
            const row = db.prepare('SELECT * FROM categories WHERE name = ?').get(query.name);
            return row ? Category._formatRow(row) : null;
        }
        return null;
    }

    static create(data) {
        const stmt = db.prepare(`
            INSERT INTO categories (name, description, default_track_stock, default_variable_price, is_active, created_at, updated_at)
            VALUES (@name, @description, @default_track_stock, @default_variable_price, 1, datetime('now'), datetime('now'))
        `);

        const result = stmt.run({
            name: data.name,
            description: data.description || null,
            default_track_stock: data.defaultTrackStock !== undefined ? (data.defaultTrackStock ? 1 : 0) : 1,
            default_variable_price: data.defaultVariablePrice ? 1 : 0,
        });

        return Category.findById(result.lastInsertRowid);
    }

    static update(id, data) {
        const cat = Category.findById(id);
        if (!cat) return null;

        db.prepare(`
            UPDATE categories SET
                name = @name, description = @description,
                default_track_stock = @default_track_stock,
                default_variable_price = @default_variable_price,
                is_active = @is_active,
                updated_at = datetime('now')
            WHERE id = @id
        `).run({
            id,
            name: data.name !== undefined ? data.name : cat.name,
            description: data.description !== undefined ? data.description : cat.description,
            default_track_stock: data.defaultTrackStock !== undefined ? (data.defaultTrackStock ? 1 : 0) : (cat.defaultTrackStock ? 1 : 0),
            default_variable_price: data.defaultVariablePrice !== undefined ? (data.defaultVariablePrice ? 1 : 0) : (cat.defaultVariablePrice ? 1 : 0),
            is_active: data.isActive !== undefined ? (data.isActive ? 1 : 0) : (cat.isActive ? 1 : 0),
        });

        return Category.findById(id);
    }

    static softDelete(id) {
        db.prepare('UPDATE categories SET is_active = 0, updated_at = datetime(\'now\') WHERE id = ?').run(id);
    }

    static _formatRow(row) {
        return {
            _id: row.id,
            id: row.id,
            name: row.name,
            description: row.description,
            defaultTrackStock: !!row.default_track_stock,
            defaultVariablePrice: !!row.default_variable_price,
            isActive: !!row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}

module.exports = Category;
