const db = require('../../database/connection');

class CashClosure {
    static findById(id) {
        const row = db.prepare('SELECT * FROM cash_closures WHERE id = ?').get(id);
        return row ? CashClosure._formatRow(row) : null;
    }

    static findByRegister(registerId, limit = 30) {
        const rows = db.prepare(`
            SELECT cc.*, u.name as user_name
            FROM cash_closures cc
            LEFT JOIN users u ON cc.user_id = u.id
            WHERE cc.register_id = ?
            ORDER BY cc.closed_at DESC
            LIMIT ?
        `).all(registerId, limit);
        return rows.map(CashClosure._formatRowWithUser);
    }

    static findAllWithFilters(filters = {}) {
        let query = `
            SELECT cc.*, u.name as user_name, r.name as register_name
            FROM cash_closures cc
            LEFT JOIN users u ON cc.user_id = u.id
            LEFT JOIN registers r ON cc.register_id = r.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.registerId) {
            query += ' AND cc.register_id = ?';
            params.push(filters.registerId);
        }
        if (filters.startDate) {
            query += ' AND cc.closed_at >= ?';
            params.push(filters.startDate);
        }
        if (filters.endDate) {
            query += ' AND cc.closed_at <= ?';
            params.push(filters.endDate);
        }

        query += ' ORDER BY cc.closed_at DESC';

        const rows = db.prepare(query).all(...params);
        return rows.map(r => {
            const formatted = CashClosure._formatRow(r);
            formatted.register = { _id: r.register_id, id: r.register_id, name: r.register_name };
            formatted.user = { _id: r.user_id, id: r.user_id, name: r.user_name };
            return formatted;
        });
    }

    static findByRegisterRaw(registerId) {
        const rows = db.prepare('SELECT * FROM cash_closures WHERE register_id = ?').all(registerId);
        return rows.map(CashClosure._formatRow);
    }

    static create(data) {
        const stmt = db.prepare(`
            INSERT INTO cash_closures (register_id, user_id, opening_balance, closing_balance, total_sales, sales_count, notes, closed_at, created_at, updated_at)
            VALUES (@register_id, @user_id, @opening_balance, @closing_balance, @total_sales, @sales_count, @notes, @closed_at, datetime('now'), datetime('now'))
        `);

        const result = stmt.run({
            register_id: data.register,
            user_id: data.user,
            opening_balance: data.openingBalance || 0,
            closing_balance: data.closingBalance,
            total_sales: data.totalSales,
            sales_count: data.salesCount,
            notes: data.notes || null,
            closed_at: data.closedAt instanceof Date ? data.closedAt.toISOString() : (data.closedAt || new Date().toISOString()),
        });

        return CashClosure.findById(result.lastInsertRowid);
    }

    static update(id, data) {
        const closure = CashClosure.findById(id);
        if (!closure) return null;

        db.prepare(`
            UPDATE cash_closures SET
                opening_balance = @opening_balance,
                closing_balance = @closing_balance,
                notes = @notes,
                updated_at = datetime('now')
            WHERE id = @id
        `).run({
            id,
            opening_balance: data.openingBalance !== undefined ? data.openingBalance : closure.openingBalance,
            closing_balance: data.closingBalance !== undefined ? data.closingBalance : closure.closingBalance,
            notes: data.notes !== undefined ? data.notes : closure.notes,
        });

        return CashClosure.findById(id);
    }

    static deleteById(id) {
        return db.prepare('DELETE FROM cash_closures WHERE id = ?').run(id);
    }

    static _formatRow(row) {
        return {
            _id: row.id,
            id: row.id,
            register: row.register_id,
            user: row.user_id,
            openingBalance: row.opening_balance,
            closingBalance: row.closing_balance,
            totalSales: row.total_sales,
            salesCount: row.sales_count,
            notes: row.notes,
            closedAt: row.closed_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }

    static _formatRowWithUser(row) {
        const formatted = CashClosure._formatRow(row);
        formatted.user = { _id: row.user_id, id: row.user_id, name: row.user_name };
        return formatted;
    }
}

module.exports = CashClosure;
