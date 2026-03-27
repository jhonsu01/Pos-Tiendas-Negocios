const db = require('../../database/connection');

class Supplier {
    static findAll() {
        const rows = db.prepare('SELECT * FROM suppliers').all();
        return rows.map(Supplier._formatRow);
    }

    static findById(id) {
        const row = db.prepare('SELECT * FROM suppliers WHERE id = ?').get(id);
        return row ? Supplier._formatRow(row) : null;
    }

    static create(data) {
        const stmt = db.prepare(`
            INSERT INTO suppliers (name, contact, phone, email, address, notes, is_active, created_at, updated_at)
            VALUES (@name, @contact, @phone, @email, @address, @notes, 1, datetime('now', 'localtime'), datetime('now', 'localtime'))
        `);

        const result = stmt.run({
            name: data.name,
            contact: data.contact || null,
            phone: data.phone || null,
            email: data.email || null,
            address: data.address || null,
            notes: data.notes || null,
        });

        return Supplier.findById(result.lastInsertRowid);
    }

    static update(id, data) {
        const supplier = Supplier.findById(id);
        if (!supplier) return null;

        db.prepare(`
            UPDATE suppliers SET
                name = @name, contact = @contact, phone = @phone,
                email = @email, address = @address, notes = @notes,
                is_active = @is_active, updated_at = datetime('now', 'localtime')
            WHERE id = @id
        `).run({
            id,
            name: data.name !== undefined ? data.name : supplier.name,
            contact: data.contact !== undefined ? data.contact : supplier.contact,
            phone: data.phone !== undefined ? data.phone : supplier.phone,
            email: data.email !== undefined ? data.email : supplier.email,
            address: data.address !== undefined ? data.address : supplier.address,
            notes: data.notes !== undefined ? data.notes : supplier.notes,
            is_active: data.isActive !== undefined ? (data.isActive ? 1 : 0) : (supplier.isActive ? 1 : 0),
        });

        return Supplier.findById(id);
    }

    static deleteById(id) {
        return db.prepare('DELETE FROM suppliers WHERE id = ?').run(id);
    }

    static _formatRow(row) {
        return {
            _id: row.id,
            id: row.id,
            name: row.name,
            contact: row.contact,
            phone: row.phone,
            email: row.email,
            address: row.address,
            notes: row.notes,
            isActive: !!row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}

module.exports = Supplier;
