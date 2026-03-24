const db = require('../../database/connection');

class Product {
    static findAll() {
        const rows = db.prepare('SELECT * FROM products ORDER BY position ASC, name ASC').all();
        return rows.map(Product._formatRow);
    }

    static findById(id) {
        const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
        return row ? Product._formatRow(row) : null;
    }

    static findOne(query) {
        if (query.sku) {
            const row = db.prepare('SELECT * FROM products WHERE sku = ?').get(query.sku);
            return row ? Product._formatRow(row) : null;
        }
        // Get last product by position (descending)
        const row = db.prepare('SELECT * FROM products ORDER BY position DESC LIMIT 1').get();
        return row ? Product._formatRow(row) : null;
    }

    static findLastByPosition() {
        const row = db.prepare('SELECT * FROM products ORDER BY position DESC LIMIT 1').get();
        return row ? Product._formatRow(row) : null;
    }

    static create(data) {
        const stmt = db.prepare(`
            INSERT INTO products (name, sku, price, stock, category, track_stock, variable_price, image, emoji, position, created_at, updated_at)
            VALUES (@name, @sku, @price, @stock, @category, @track_stock, @variable_price, @image, @emoji, @position, datetime('now'), datetime('now'))
        `);

        const result = stmt.run({
            name: data.name,
            sku: data.sku || null,
            price: data.price || 0,
            stock: data.stock || 0,
            category: data.category,
            track_stock: data.trackStock !== undefined ? (data.trackStock ? 1 : 0) : 1,
            variable_price: data.variablePrice ? 1 : 0,
            image: data.image || null,
            emoji: data.emoji || null,
            position: data.position || 0,
        });

        return Product.findById(result.lastInsertRowid);
    }

    static update(id, data) {
        const product = Product.findById(id);
        if (!product) return null;

        const stmt = db.prepare(`
            UPDATE products SET
                name = @name, sku = @sku, price = @price, stock = @stock,
                category = @category, track_stock = @track_stock,
                variable_price = @variable_price, image = @image,
                emoji = @emoji, position = @position,
                updated_at = datetime('now')
            WHERE id = @id
        `);

        stmt.run({
            id,
            name: data.name !== undefined ? data.name : product.name,
            sku: data.sku !== undefined ? data.sku : product.sku,
            price: data.price !== undefined ? data.price : product.price,
            stock: data.stock !== undefined ? data.stock : product.stock,
            category: data.category !== undefined ? data.category : product.category,
            track_stock: data.trackStock !== undefined ? (data.trackStock ? 1 : 0) : (product.trackStock ? 1 : 0),
            variable_price: data.variablePrice !== undefined ? (data.variablePrice ? 1 : 0) : (product.variablePrice ? 1 : 0),
            image: data.image !== undefined ? data.image : product.image,
            emoji: data.emoji !== undefined ? data.emoji : product.emoji,
            position: data.position !== undefined ? data.position : product.position,
        });

        return Product.findById(id);
    }

    static updateStock(id, newStock) {
        db.prepare('UPDATE products SET stock = ?, updated_at = datetime(\'now\') WHERE id = ?').run(newStock, id);
    }

    static updatePosition(id, position) {
        db.prepare('UPDATE products SET position = ?, updated_at = datetime(\'now\') WHERE id = ?').run(position, id);
    }

    static deleteById(id) {
        return db.prepare('DELETE FROM products WHERE id = ?').run(id);
    }

    static _formatRow(row) {
        return {
            _id: row.id,
            id: row.id,
            name: row.name,
            sku: row.sku,
            price: row.price,
            stock: row.stock,
            category: row.category,
            trackStock: !!row.track_stock,
            variablePrice: !!row.variable_price,
            image: row.image,
            emoji: row.emoji,
            position: row.position,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}

module.exports = Product;
