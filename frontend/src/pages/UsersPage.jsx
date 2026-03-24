import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit, Trash2, User, Shield, Key } from 'lucide-react';

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'cashier',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update (password is optional)
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;

                await api.put(`/users/${editingId}`, updateData);
            } else {
                // Create
                await api.post('/users', formData);
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({ name: '', username: '', password: '', role: 'cashier' });
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Error al guardar usuario');
        }
    };

    const handleEdit = (user) => {
        setEditingId(user._id);
        setFormData({
            name: user.name,
            username: user.username,
            password: '', // Don't show password
            role: user.role,
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Usuarios</h2>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', username: '', password: '', role: 'cashier' });
                        setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Licencia</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => {
                            const isExpired = user.licenseExpiresAt && new Date() > new Date(user.licenseExpiresAt);
                            const licenseText = user.licenseExpiresAt
                                ? new Date(user.licenseExpiresAt).toLocaleDateString()
                                : '∞ De por vida';

                            return (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {user.role === 'admin' ? 'Administrador' : 'Cajero'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${!user.licenseExpiresAt ? 'bg-blue-100 text-blue-800' :
                                                isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {isExpired ? '❌ Vencida: ' : ''}{licenseText}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                        <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-900">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {users.map((user) => {
                    const isExpired = user.licenseExpiresAt && new Date() > new Date(user.licenseExpiresAt);
                    const licenseText = user.licenseExpiresAt
                        ? new Date(user.licenseExpiresAt).toLocaleDateString()
                        : '∞ De por vida';

                    return (
                        <div key={user._id} className="bg-white shadow-md rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center flex-1">
                                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3 text-blue-600">
                                        <User className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                        <p className="text-sm text-gray-500">@{user.username}</p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-900 p-2">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900 p-2">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                    {user.role === 'admin' ? 'Administrador' : 'Cajero'}
                                </span>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${!user.licenseExpiresAt ? 'bg-blue-100 text-blue-800' :
                                        isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                    Licencia: {isExpired ? '❌ Vencida ' : ''}{licenseText}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 md:p-8 rounded-lg w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        className="w-full pl-9 p-2 border rounded"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Nombre de Usuario</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        className="w-full pl-9 p-2 border rounded"
                                        value={formData.username}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    {editingId ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
                                </label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                    <input
                                        type="password"
                                        className="w-full pl-9 p-2 border rounded"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingId}
                                        placeholder={editingId ? 'Dejar en blanco para mantener actual' : ''}
                                    />
                                </div>
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Rol</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="cashier">Cajero</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
