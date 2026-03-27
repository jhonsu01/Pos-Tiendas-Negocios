const db = require('../../database/connection');

class SupplierPayment {
    static findById(id) {
        const row = db.prepare('SELECT * FROM supplier_payments WHERE id = ?').get(id);
        return row ? SupplierPayment._formatRow(row) : null;
    }

    static findBySupplier(supplierId) {
        const rows = db.prepare(`
            SELECT sp.*, r.name as register_name, u.name as user_name
            FROM supplier_payments sp
            LEFT JOIN registers r ON sp.register_id = r.id
            LEFT JOIN users u ON sp.user_id = u.id
            WHERE sp.supplier_id = ?
            ORDER BY sp.payment_date DESC
        `).all(supplierId);
        return rows.map(SupplierPayment._formatRowPopulated);
    }

    static findAll(limit = 100) {
        const rows = db.prepare(`
            SELECT sp.*, s.name as supplier_name, r.name as register_name, u.name as user_name
            FROM supplier_payments sp
            LEFT JOIN suppliers s ON sp.supplier_id = s.id
            LEFT JOIN registers r ON sp.register_id = r.id
            LEFT JOIN users u ON sp.user_id = u.id
            ORDER BY sp.payment_date DESC
            LIMIT ?
        `).all(limit);
        return rows.map(r => {
            const formatted = SupplierPayment._formatRow(r);
            formatted.supplier = { _id: r.supplier_id, id: r.supplier_id, name: r.supplier_name };
            formatted.register = { _id: r.register_id, id: r.register_id, name: r.register_name };
            formatted.user = { _id: r.user_id, id: r.user_id, name: r.user_name };
            return formatted;
        });
    }

    static findByRegister(registerId) {
        const rows = db.prepare('SELECT * FROM supplier_payments WHERE register_id = ?').all(registerId);
        return rows.map(SupplierPayment._formatRow);
    }

    static create(data) {
        const stmt = db.prepare(`
            INSERT INTO supplier_payments (supplier_id, register_id, user_id, amount, description, payment_date, created_at, updated_at)
            VALUES (@supplier_id, @register_id, @user_id, @amount, @description, @payment_date, datetime('now', 'localtime'), datetime('now', 'localtime'))
        `);

        const result = stmt.run({
            supplier_id: data.supplier,
            register_id: data.register,
            user_id: data.user,
            amount: data.amount,
            description: data.description || null,
            payment_date: data.paymentDate || new Date().toISOString(),
        });

        return SupplierPayment.findByIdPopulated(result.lastInsertRowid);
    }

    static findByIdPopulated(id) {
        const row = db.prepare(`
            SELECT sp.*, s.name as supplier_name, r.name as register_name, u.name as user_name
            FROM supplier_payments sp
            LEFT JOIN suppliers s ON sp.supplier_id = s.id
            LEFT JOIN registers r ON sp.register_id = r.id
            LEFT JOIN users u ON sp.user_id = u.id
            WHERE sp.id = ?
        `).get(id);

        if (!row) return null;

        const formatted = SupplierPayment._formatRow(row);
        formatted.supplier = { _id: row.supplier_id, id: row.supplier_id, name: row.supplier_name };
        formatted.register = { _id: row.register_id, id: row.register_id, name: row.register_name };
        formatted.user = { _id: row.user_id, id: row.user_id, name: row.user_name };
        return formatted;
    }

    static update(id, data) {
        const payment = SupplierPayment.findById(id);
        if (!payment) return null;

        db.prepare(`
            UPDATE supplier_payments SET
                amount = @amount, description = @description,
                register_id = @register_id, updated_at = datetime('now', 'localtime')
            WHERE id = @id
        `).run({
            id,
            amount: data.amount !== undefined ? data.amount : payment.amount,
            description: data.description !== undefined ? data.description : payment.description,
            register_id: data.register !== undefined ? data.register : payment.register,
        });

        return SupplierPayment.findByIdPopulated(id);
    }

    static deleteById(id) {
        return db.prepare('DELETE FROM supplier_payments WHERE id = ?').run(id);
    }

    static _formatRow(row) {
        return {
            _id: row.id,
            id: row.id,
            supplier: row.supplier_id,
            register: row.register_id,
            user: row.user_id,
            amount: row.amount,
            description: row.description,
            paymentDate: row.payment_date,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    static _formatRowPopulated(row) {
        const formatted = SupplierPayment._formatRow(row);
        formatted.register = { _id: row.register_id, id: row.register_id, name: row.register_name };
        formatted.user = { _id: row.user_id, id: row.user_id, name: row.user_name };
        return formatted;
    }
}

module.exports = SupplierPayment;
