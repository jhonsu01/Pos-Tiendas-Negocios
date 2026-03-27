const db = require('../../database/connection');

class Transfer {
    static findPending() {
        const rows = db.prepare("SELECT * FROM transfers WHERE status = 'pending' ORDER BY created_at DESC").all();
        return rows.map(Transfer._formatRow);
    }

    static findById(id) {
        const row = db.prepare('SELECT * FROM transfers WHERE id = ?').get(id);
        return row ? Transfer._formatRow(row) : null;
    }

    static create(data) {
        const stmt = db.prepare(`
            INSERT INTO transfers (customer_name, user_id, total_amount, status, created_at, updated_at)
            VALUES (@customer_name, @user_id, @total_amount, 'pending', datetime('now', 'localtime'), datetime('now', 'localtime'))
        `);

        const result = stmt.run({
            customer_name: data.customerName,
            user_id: data.user,
            total_amount: data.totalAmount || 0,
        });

        const transferId = result.lastInsertRowid;

        if (data.items && data.items.length > 0) {
            const insertItem = db.prepare(`
                INSERT INTO transfer_items (transfer_id, product_id, name, qty, price, category)
                VALUES (@transfer_id, @product_id, @name, @qty, @price, @category)
            `);
            for (const item of data.items) {
                insertItem.run({
                    transfer_id: transferId,
                    product_id: item.product || null,
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                    category: item.category || null,
                });
            }
        }

        return Transfer.findById(transferId);
    }

    static markPaid(id) {
        db.prepare(`
            UPDATE transfers SET status = 'paid', paid_at = datetime('now', 'localtime'), updated_at = datetime('now', 'localtime')
            WHERE id = ?
        `).run(id);
        return Transfer.findById(id);
    }

    static deleteById(id) {
        db.prepare('DELETE FROM transfer_items WHERE transfer_id = ?').run(id);
        return db.prepare('DELETE FROM transfers WHERE id = ?').run(id);
    }

    static getItems(transferId) {
        const rows = db.prepare('SELECT * FROM transfer_items WHERE transfer_id = ?').all(transferId);
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
        const items = Transfer.getItems(row.id);
        return {
            _id: row.id,
            id: row.id,
            customerName: row.customer_name,
            user: row.user_id,
            items,
            totalAmount: row.total_amount,
            status: row.status,
            paidAt: row.paid_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}

module.exports = Transfer;
