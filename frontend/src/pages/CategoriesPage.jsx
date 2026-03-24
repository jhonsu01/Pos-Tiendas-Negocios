import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        defaultTrackStock: true,
        defaultVariablePrice: false,
    });
    const [editingId, setEditingId] = useState(null);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/categories/${editingId}`, formData);
            } else {
                await api.post('/categories', formData);
            }
            setShowModal(false);
            setFormData({ name: '', description: '', defaultTrackStock: true, defaultVariablePrice: false });
            setEditingId(null);
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert(error.response?.data?.message || 'Error al guardar categoría');
        }
    };

    const handleEdit = (category) => {
        setFormData({
            name: category.name,
            description: category.description || '',
            defaultTrackStock: category.defaultTrackStock,
            defaultVariablePrice: category.defaultVariablePrice,
        });
        setEditingId(category._id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Categorías</h2>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', description: '', defaultTrackStock: true, defaultVariablePrice: false });
                        setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Categoría
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <div key={category._id} className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <Tag className="w-6 h-6 text-blue-600 mr-2" />
                                <h3 className="text-lg font-bold">{category.name}</h3>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-900">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(category._id)} className="text-red-600 hover:text-red-900">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        {category.description && (
                            <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                        )}
                        <div className="space-y-2">
                            <div className="flex items-center text-sm">
                                <span className={`px-2 py-1 rounded text-xs ${category.defaultTrackStock ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {category.defaultTrackStock ? 'Con inventario' : 'Sin inventario'}
                                </span>
                            </div>
                            <div className="flex items-center text-sm">
                                <span className={`px-2 py-1 rounded text-xs ${category.defaultVariablePrice ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {category.defaultVariablePrice ? 'Precio variable' : 'Precio fijo'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg w-96">
                        <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Categoría' : 'Agregar Categoría'}</h3>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Nombre"
                                className="w-full mb-3 p-2 border rounded"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Descripción (opcional)"
                                className="w-full mb-3 p-2 border rounded"
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            <div className="mb-4 p-3 bg-gray-50 rounded">
                                <p className="text-sm font-semibold mb-2 text-gray-700">Configuración por defecto:</p>
                                <div className="mb-3 flex items-center">
                                    <input
                                        type="checkbox"
                                        id="defaultTrackStock"
                                        className="mr-2"
                                        checked={formData.defaultTrackStock}
                                        onChange={(e) => setFormData({ ...formData, defaultTrackStock: e.target.checked })}
                                    />
                                    <label htmlFor="defaultTrackStock" className="text-sm text-gray-700">Controlar inventario por defecto</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="defaultVariablePrice"
                                        className="mr-2"
                                        checked={formData.defaultVariablePrice}
                                        onChange={(e) => setFormData({ ...formData, defaultVariablePrice: e.target.checked })}
                                    />
                                    <label htmlFor="defaultVariablePrice" className="text-sm text-gray-700">Precio variable por defecto</label>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

export default CategoriesPage;
