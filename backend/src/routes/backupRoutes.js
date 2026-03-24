const express = require('express');
const router = express.Router();
const backupManager = require('../utils/backup');
const { protect, admin } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/backups/create
 * @desc    Crear un nuevo respaldo de la base de datos
 * @access  Private/Admin
 */
router.post('/create', protect, admin, async (req, res) => {
    try {
        const { description } = req.body;

        const result = await backupManager.createBackup(description);

        res.json({
            success: true,
            message: 'Respaldo creado exitosamente',
            backup: result.backup
        });
    } catch (error) {
        console.error('Error creando respaldo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el respaldo',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/backups/restore/:backupName
 * @desc    Restaurar la base de datos desde un respaldo
 * @access  Private/Admin
 */
router.post('/restore/:backupName', protect, admin, async (req, res) => {
    try {
        const { backupName } = req.params;

        const result = await backupManager.restoreBackup(backupName);

        res.json({
            success: true,
            message: 'Base de datos restaurada exitosamente',
            backup: result.backup
        });
    } catch (error) {
        console.error('Error restaurando respaldo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al restaurar el respaldo',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/backups/list
 * @desc    Listar todos los respaldos disponibles
 * @access  Private/Admin
 */
router.get('/list', protect, admin, async (req, res) => {
    try {
        const backups = await backupManager.listBackups();

        res.json({
            success: true,
            count: backups.length,
            backups: backups.map(backup => ({
                ...backup,
                sizeFormatted: backupManager.formatSize(backup.size)
            }))
        });
    } catch (error) {
        console.error('Error listando respaldos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar los respaldos',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/backups/delete/:backupName
 * @desc    Eliminar un respaldo
 * @access  Private/Admin
 */
router.delete('/delete/:backupName', protect, admin, async (req, res) => {
    try {
        const { backupName } = req.params;

        const result = await backupManager.deleteBackup(backupName);

        res.json({
            success: true,
            message: 'Respaldo eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error eliminando respaldo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el respaldo',
            error: error.message
        });
    }
});

module.exports = router;
