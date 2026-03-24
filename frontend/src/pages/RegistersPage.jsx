import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Edit, Trash2 } from 'lucide-react';

const RegistersPage = () => {
    const [registers, setRegisters] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingRegister, setEditingRegister] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categories: [],
    });
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchRegisters();
        fetchCategories();
    }, []);

    const fetchRegisters = async () => {
        try {
            const { data } = await api.get('/registers');
            setRegisters(data);
        } catch (error) {
            console.error('Error fetching registers:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRegister) {
                await api.put(`/registers/${editingRegister._id}`, formData);
                alert('Caja actualizada exitosamente');
            } else {
                await api.post('/registers', formData);
                alert('Caja creada exitosamente');
            }
            setShowModal(false);
            setEditingRegister(null);
            setFormData({ name: '', description: '', categories: [] });
            fetchRegisters();
        } catch (error) {
            console.error('Error saving register:', error);
            alert('Error al guardar la caja');
        }
    };

    const handleEdit = (register) => {
        setEditingRegister(register);
        setFormData({
            name: register.name,
            description: register.description || '',
            categories: register.categories || [],
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta caja?')) {
            try {
                await api.delete(`/registers/${id}`);
                alert('Caja eliminada exitosamente');
                fetchRegisters();
            } catch (error) {
                console.error('Error deleting register:', error);
                alert('Error al eliminar la caja');
            }
        }
    };

    const toggleCategory = (categoryName) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(categoryName)
                ? prev.categories.filter(c => c !== categoryName)
                : [...prev.categories, categoryName]
        }));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Cajas</h2>
                <button
                    onClick={() => {
                        setEditingRegister(null);
                        setFormData({ name: '', description: '', categories: [] });
                        setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    + Nueva Caja
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registers.map((register) => (
                    <div key={register._id} className="bg-white rounded-lg shadow-md p-6 relative">
                        <div className="absolute top-4 right-4 flex space-x-2">
                            <button
                                onClick={() => handleEdit(register)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Editar"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(register._id)}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2 pr-16">{register.name}</h3>
                        {register.description && (
                            <p className="text-gray-600 text-sm mb-4">{register.description}</p>
                        )}
                        {register.categories && register.categories.length > 0 ? (
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Categorías asignadas:</p>
                                <div className="flex flex-wrap gap-2">
                                    {register.categories.map((cat, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic">Sin categorías asignadas</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {editingRegister ? 'Editar Caja' : 'Nueva Caja'}
                        </h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Nombre *</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Categorías</label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Las ventas de productos de estas categorías se asignarán automáticamente a esta caja
                                </p>
                                <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2">
                                    {categories.map((cat) => (
                                        <label key={cat._id} className="flex items-center hover:bg-gray-50 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={formData.categories.includes(cat.name)}
                                                onChange={() => toggleCategory(cat.name)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">{cat.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingRegister(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {editingRegister ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegistersPage;
