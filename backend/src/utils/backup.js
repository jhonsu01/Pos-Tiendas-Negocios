const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

class BackupManager {
    constructor() {
        this.backupDir = path.join(__dirname, '../../backups');
        this.dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/database.sqlite');

        if (!fsSync.existsSync(this.backupDir)) {
            try {
                fsSync.mkdirSync(this.backupDir, { recursive: true });
            } catch (error) {
                console.error('Error creando directorio de respaldos:', error);
            }
        }
    }

    async ensureBackupDir() {
        try {
            await fs.mkdir(this.backupDir, { recursive: true });
        } catch (error) {
            console.error('Error creando directorio de respaldos:', error);
        }
    }

    /**
     * Crear un respaldo de la base de datos SQLite
     */
    async createBackup(description = '') {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupName = `backup_${timestamp}`;
            const backupPath = path.join(this.backupDir, backupName);

            await fs.mkdir(backupPath, { recursive: true });

            // Copy the SQLite database file
            const destPath = path.join(backupPath, 'database.sqlite');
            await fs.copyFile(this.dbPath, destPath);

            // Calculate size
            const stats = await fs.stat(destPath);
            const size = stats.size;

            // Create metadata
            const metadata = {
                name: backupName,
                description: description || 'Respaldo automático',
                date: new Date().toISOString(),
                dbType: 'sqlite',
                size: size,
            };

            await fs.writeFile(
                path.join(backupPath, 'metadata.json'),
                JSON.stringify(metadata, null, 2)
            );

            console.log('Respaldo creado exitosamente:', backupName);

            return {
                success: true,
                backup: metadata,
                path: backupPath
            };
        } catch (error) {
            console.error('Error al crear respaldo:', error);
            throw error;
        }
    }

    /**
     * Restaurar desde un respaldo
     */
    async restoreBackup(backupName) {
        try {
            const backupPath = path.join(this.backupDir, backupName);
            const sourcePath = path.join(backupPath, 'database.sqlite');

            if (!fsSync.existsSync(sourcePath)) {
                throw new Error('El respaldo no existe o está corrupto');
            }

            // Close current DB connection before restoring
            const db = require('../../database/connection');
            db.close();

            // Copy backup over current database
            await fs.copyFile(sourcePath, this.dbPath);

            console.log('Base de datos restaurada exitosamente desde:', backupName);

            return {
                success: true,
                message: 'Base de datos restaurada exitosamente. Reinicie el servidor para aplicar los cambios.',
                backup: backupName
            };
        } catch (error) {
            console.error('Error al restaurar respaldo:', error);
            throw error;
        }
    }

    /**
     * Listar todos los respaldos disponibles
     */
    async listBackups() {
        try {
            await this.ensureBackupDir();

            if (!fsSync.existsSync(this.backupDir)) {
                return [];
            }

            const files = await fs.readdir(this.backupDir);
            const backups = [];

            for (const file of files) {
                const filePath = path.join(this.backupDir, file);

                try {
                    const stats = await fs.stat(filePath);
                    if (!stats.isDirectory()) continue;
                } catch (error) {
                    continue;
                }

                const metadataPath = path.join(filePath, 'metadata.json');

                if (fsSync.existsSync(metadataPath)) {
                    try {
                        const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
                        backups.push(metadata);
                    } catch (error) {
                        console.error(`Error leyendo metadata de ${file}:`, error);
                    }
                }
            }

            backups.sort((a, b) => new Date(b.date) - new Date(a.date));
            return backups;
        } catch (error) {
            console.error('Error listando respaldos:', error);
            return [];
        }
    }

    /**
     * Eliminar un respaldo
     */
    async deleteBackup(backupName) {
        try {
            const backupPath = path.join(this.backupDir, backupName);

            if (!fsSync.existsSync(backupPath)) {
                throw new Error('El respaldo no existe');
            }

            await fs.rm(backupPath, { recursive: true, force: true });

            return {
                success: true,
                message: 'Respaldo eliminado exitosamente'
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Formatear tamaño en bytes a formato legible
     */
    formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
}

module.exports = new BackupManager();
