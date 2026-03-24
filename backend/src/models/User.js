const db = require('../../database/connection');
const bcrypt = require('bcryptjs');

class User {
    static findOne(query) {
        if (query.username) {
            const row = db.prepare('SELECT * FROM users WHERE username = ?').get(query.username);
            return row ? User._wrap(row) : null;
        }
        return null;
    }

    static findById(id) {
        const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        return row ? User._wrap(row) : null;
    }

    static findByIdWithoutPassword(id) {
        const row = db.prepare('SELECT id, name, username, role, license_expires_at, created_at, updated_at FROM users WHERE id = ?').get(id);
        if (!row) return null;
        return User._formatRow(row);
    }

    static findAll() {
        const rows = db.prepare('SELECT id, name, username, role, license_expires_at, created_at, updated_at FROM users').all();
        return rows.map(r => User._formatRow(r));
    }

    static create(data) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(data.password, salt);

        const stmt = db.prepare(`
            INSERT INTO users (name, username, password, role, license_expires_at, created_at, updated_at)
            VALUES (@name, @username, @password, @role, @license_expires_at, datetime('now'), datetime('now'))
        `);

        const result = stmt.run({
            name: data.name,
            username: data.username,
            password: hashedPassword,
            role: data.role || 'cashier',
            license_expires_at: data.licenseExpiresAt || null,
        });

        return User.findById(result.lastInsertRowid);
    }

    static update(id, data) {
        const user = User.findById(id);
        if (!user) return null;

        const name = data.name || user.name;
        const username = data.username || user.username;
        const role = data.role || user.role;

        let password = user.password;
        if (data.password) {
            const salt = bcrypt.genSaltSync(10);
            password = bcrypt.hashSync(data.password, salt);
        }

        db.prepare(`
            UPDATE users SET name = ?, username = ?, password = ?, role = ?, updated_at = datetime('now')
            WHERE id = ?
        `).run(name, username, password, role, id);

        return User.findById(id);
    }

    static deleteById(id) {
        return db.prepare('DELETE FROM users WHERE id = ?').run(id);
    }

    static _wrap(row) {
        const obj = User._formatRow(row);
        obj.password = row.password;
        obj.matchPassword = (enteredPassword) => {
            return bcrypt.compareSync(enteredPassword, row.password);
        };
        return obj;
    }

    static _formatRow(row) {
        return {
            _id: row.id,
            id: row.id,
            name: row.name,
            username: row.username,
            role: row.role,
            licenseExpiresAt: row.license_expires_at,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}

module.exports = User;
