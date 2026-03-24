const db = require('../../database/connection');

class Settings {
    static findOne() {
        const row = db.prepare('SELECT * FROM settings LIMIT 1').get();
        return row ? Settings._formatRow(row) : null;
    }

    static create(data) {
        const stmt = db.prepare(`
            INSERT INTO settings (store_name, store_logo, logo_size, created_at, updated_at)
            VALUES (@store_name, @store_logo, @logo_size, datetime('now'), datetime('now'))
        `);

        const result = stmt.run({
            store_name: data.storeName || 'POS Moderno',
            store_logo: data.storeLogo || '',
            logo_size: data.logoSize || 80,
        });

        return Settings.findOne();
    }

    static upsert(data) {
        const existing = Settings.findOne();

        if (existing) {
            db.prepare(`
                UPDATE settings SET
                    store_name = @store_name,
                    store_logo = @store_logo,
                    logo_size = @logo_size,
                    updated_at = datetime('now')
                WHERE id = @id
            `).run({
                id: existing.id,
                store_name: data.storeName !== undefined ? data.storeName : existing.storeName,
                store_logo: data.storeLogo !== undefined ? data.storeLogo : existing.storeLogo,
                logo_size: data.logoSize !== undefined ? data.logoSize : existing.logoSize,
            });

            return Settings.findOne();
        } else {
            return Settings.create(data);
        }
    }

    static _formatRow(row) {
        return {
            _id: row.id,
            id: row.id,
            storeName: row.store_name,
            storeLogo: row.store_logo,
            logoSize: row.logo_size,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}

module.exports = Settings;
