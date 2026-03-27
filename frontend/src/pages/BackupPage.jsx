import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import {
    Database,
    Download,
    Upload,
    Trash2,
    Plus,
    AlertCircle,
    CheckCircle,
    Clock,
    HardDrive
} from 'lucide-react';

const BackupPage = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [description, setDescription] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/backups/list');
            setBackups(data.backups || []);
        } catch (error) {
            console.error('Error fetching backups:', error);
            showMessage('error', 'Error al cargar los respaldos');
        } finally {
            setLoading(false);
        }
    };

    const createBackup = async () => {
        if (!description.trim()) {
            showMessage('error', 'Por favor ingresa una descripción');
            return;
        }

        setCreating(true);
        try {
            const { data } = await api.post('/backups/create', { description });
            showMessage('success', 'Respaldo creado exitosamente');
            setShowCreateModal(false);
            setDescription('');
            fetchBackups();
        } catch (error) {
            console.error('Error creating backup:', error);
            showMessage('error', 'Error al crear el respaldo');
        } finally {
            setCreating(false);
        }
    };

    const restoreBackup = async (backupName) => {
        if (!confirm('⚠️ ADVERTENCIA: Esta acción reemplazará todos los datos actuales con los del respaldo. ¿Estás seguro?')) {
            return;
        }

        setLoading(true);
        try {
            await api.post(`/backups/restore/${backupName}`);
            showMessage('success', 'Base de datos restaurada exitosamente. Recargando...');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error restoring backup:', error);
            showMessage('error', 'Error al restaurar el respaldo');
            setLoading(false);
        }
    };

    const deleteBackup = async (backupName) => {
        if (!confirm('¿Estás seguro de eliminar este respaldo?')) {
            return;
        }

        setLoading(true);
        try {
            await api.delete(`/backups/delete/${backupName}`);
            showMessage('success', 'Respaldo eliminado exitosamente');
            fetchBackups();
        } catch (error) {
            console.error('Error deleting backup:', error);
            showMessage('error', 'Error al eliminar el respaldo');
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Database className="w-8 h-8 mr-3 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Respaldos</h2>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Respaldo
                </button>
            </div>

            {/* Message Alert */}
            {message.text && (
                <div className={`mb-4 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                        <AlertCircle className="w-5 h-5 mr-2" />
                    )}
                    {message.text}
                </div>
            )}

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Información Importante</h3>
                        <p className="text-sm text-blue-800">
                            Los respaldos guardan una copia completa de tu base de datos.
                            Puedes restaurar cualquier respaldo para volver a un estado anterior.
                            Se recomienda crear respaldos regularmente antes de realizar cambios importantes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Backups List */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {loading && backups.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando respaldos...</p>
                    </div>
                ) : backups.length === 0 ? (
                    <div className="p-8 text-center">
                        <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No hay respaldos disponibles</p>
                        <p className="text-sm text-gray-500 mt-2">Crea tu primer respaldo para comenzar</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Descripción
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tamaño
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {backups.map((backup) => (
                                    <tr key={backup.name} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <HardDrive className="w-5 h-5 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {backup.description}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {backup.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                                {formatDate(backup.date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {backup.sizeFormatted}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => restoreBackup(backup.name)}
                                                    disabled={loading}
                                                    className="text-green-600 hover:text-green-900 disabled:opacity-50 flex items-center"
                                                    title="Restaurar"
                                                >
                                                    <Upload className="w-4 h-4 mr-1" />
                                                    Restaurar
                                                </button>
                                                <button
                                                    onClick={() => deleteBackup(backup.name)}
                                                    disabled={loading}
                                                    className="text-red-600 hover:text-red-900 disabled:opacity-50 flex items-center"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Backup Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Respaldo</h3>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Descripción del Respaldo
                            </label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ej: Respaldo antes de actualización"
                                autoFocus
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Describe el motivo de este respaldo para identificarlo fácilmente
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={createBackup}
                                disabled={creating}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                            >
                                {creating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Creando...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4 mr-2" />
                                        Crear Respaldo
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setDescription('');
                                }}
                                disabled={creating}
                                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BackupPage;
