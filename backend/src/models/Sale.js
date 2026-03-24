const db = require('../../database/connection');

class Sale {
    static findAll(options = {}) {
        let query = `
            SELECT s.*, u.name as user_name
            FROM sales s
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
        `;
        const rows = db.prepare(query).all();
        return rows.map(Sale._formatRowWithUser);
    }

    static findById(id) {
        const row = db.prepare(`
            SELECT s.*, u.name as user_name
            FROM sales s
            LEFT JOIN users u ON s.user_id = u.id
            WHERE s.id = ?
        `).get(id);
        return row ? Sale._formatRowWithUser(row) : null;
    }

    static findByRegisterAndDateRange(registerId, startDate, endDate) {
        // Include sales for this register OR sales with no register
        const rows = db.prepare(`
            SELECT * FROM sales
            WHERE (register_id = ? OR register_id IS NULL)
            AND created_at >= ? AND created_at < ?
        `).all(registerId, startDate, endDate);
        return rows.map(Sale._formatRow);
    }

    static create(data) {
        const insertSale = db.prepare(`
            INSERT INTO sales (register_id, user_id, total_amount, payment_method, is_transfer_payment, created_at, updated_at)
            VALUES (@register_id, @user_id, @total_amount, @payment_method, @is_transfer_payment, datetime('now'), datetime('now'))
        `);

        const insertItem = db.prepare(`
            INSERT INTO sale_items (sale_id, product_id, name, qty, price, category)
            VALUES (@sale_id, @product_id, @name, @qty, @price, @category)
        `);

        const result = insertSale.run({
            register_id: data.register || null,
            user_id: data.user,
            total_amount: data.totalAmount,
            payment_method: data.paymentMethod || 'Cash',
            is_transfer_payment: data.isTransferPayment ? 1 : 0,
        });

        const saleId = result.lastInsertRowid;

        if (data.items && data.items.length > 0) {
            for (const item of data.items) {
                insertItem.run({
                    sale_id: saleId,
                    product_id: item.product || null,
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                    category: item.category || null,
                });
            }
        }

        return Sale.findById(saleId);
    }

    static update(id, data) {
        // Delete old items
        db.prepare('DELETE FROM sale_items WHERE sale_id = ?').run(id);

        // Update sale
        const fields = [];
        const values = {};
        values.id = id;

        if (data.totalAmount !== undefined) { fields.push('total_amount = @total_amount'); values.total_amount = data.totalAmount; }
        if (data.paymentMethod !== undefined) { fields.push('payment_method = @payment_method'); values.payment_method = data.paymentMethod; }
        fields.push("updated_at = datetime('now')");

        if (fields.length > 0) {
            db.prepare(`UPDATE sales SET ${fields.join(', ')} WHERE id = @id`).run(values);
        }

        // Insert new items
        if (data.items && data.items.length > 0) {
            const insertItem = db.prepare(`
                INSERT INTO sale_items (sale_id, product_id, name, qty, price, category)
                VALUES (@sale_id, @product_id, @name, @qty, @price, @category)
            `);
            for (const item of data.items) {
                insertItem.run({
                    sale_id: id,
                    product_id: item.product || null,
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                    category: item.category || null,
                });
            }
        }

        return Sale.findById(id);
    }

    static deleteById(id) {
        db.prepare('DELETE FROM sale_items WHERE sale_id = ?').run(id);
        return db.prepare('DELETE FROM sales WHERE id = ?').run(id);
    }

    static getItems(saleId) {
        const rows = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleId);
        return rows.map(r => ({
            _id: r.id,
            product: r.product_id,
            name: r.name,
            qty: r.qty,
            price: r.price,
            category: r.category,
        }));
    }

    static _formatRow(row) {
        const items = Sale.getItems(row.id);
        return {
            _id: row.id,
            id: row.id,
            register: row.register_id,
            user: row.user_id,
            items,
            totalAmount: row.total_amount,
            paymentMethod: row.payment_method,
            isTransferPayment: !!row.is_transfer_payment,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    static _formatRowWithUser(row) {
        const sale = Sale._formatRow(row);
        sale.user = {
            _id: row.user_id,
            id: row.user_id,
            name: row.user_name,
        };
        return sale;
    }
}

module.exports = Sale;
