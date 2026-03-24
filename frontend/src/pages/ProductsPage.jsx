import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Plus, Edit, Trash2, PlusCircle } from 'lucide-react';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        category: '',
        trackStock: true,
        variablePrice: false,
        image: '',
        emoji: '',
    });
    const [editingId, setEditingId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [stockToAdd, setStockToAdd] = useState({});
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories'),
                ]);
                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting product:', formData);
        try {
            if (editingId) {
                await api.put(`/products/${editingId}`, formData);
            } else {
                await api.post('/products', formData);
            }
            setShowModal(false);
            setFormData({ name: '', price: '', stock: '', category: '', trackStock: true, variablePrice: false, image: '', emoji: '' });
            setEditingId(null);
            const { data: productsData } = await api.get('/products');
            setProducts(productsData);
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error al guardar producto: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleCategoryChange = (categoryName) => {
        const selectedCategory = categories.find(c => c.name === categoryName);
        if (selectedCategory && !editingId) {
            setFormData({
                ...formData,
                category: categoryName,
                trackStock: selectedCategory.defaultTrackStock,
                variablePrice: selectedCategory.defaultVariablePrice,
                price: selectedCategory.defaultVariablePrice ? '0' : formData.price,
                stock: selectedCategory.defaultTrackStock ? formData.stock : '0',
            });
        } else {
            setFormData({ ...formData, category: categoryName });
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            price: product.price,
            stock: product.stock,
            category: product.category,
            trackStock: product.trackStock !== undefined ? product.trackStock : true,
            variablePrice: product.variablePrice || false,
            image: product.image || '',
            emoji: product.emoji || '',
        });
        setEditingId(product._id);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro?')) {
            try {
                await api.delete(`/products/${id}`);
                const { data: productsData } = await api.get('/products');
                setProducts(productsData);
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleAddStock = async (productId) => {
        const quantity = parseInt(stockToAdd[productId] || 0);
        if (quantity <= 0) {
            alert('Por favor ingresa una cantidad válida mayor a 0');
            return;
        }

        try {
            const product = products.find(p => p._id === productId);
            const newStock = parseInt(product.stock) + quantity;

            await api.put(`/products/${productId}`, {
                ...product,
                stock: newStock
            });

            // Refrescar productos
            const { data: productsData } = await api.get('/products');
            setProducts(productsData);

            // Limpiar el input
            setStockToAdd({ ...stockToAdd, [productId]: '' });
        } catch (error) {
            console.error('Error adding stock:', error);
            alert('Error al agregar stock: ' + (error.response?.data?.message || error.message));
        }
    };

    const onDragStart = (e, index) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const onDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (dragOverIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const onDrop = async (e, index) => {
        e.preventDefault();
        setDragOverIndex(null);
        if (draggedItemIndex === null || draggedItemIndex === index) {
            setDraggedItemIndex(null);
            return;
        }

        const updatedProducts = [...products];
        const itemToMove = updatedProducts[draggedItemIndex];
        updatedProducts.splice(draggedItemIndex, 1);
        updatedProducts.splice(index, 0, itemToMove);

        // Update local state immediately for responsiveness
        setProducts(updatedProducts);
        setDraggedItemIndex(null);

        // Persist to backend
        try {
            const positions = updatedProducts.map((p, idx) => ({
                id: p._id,
                position: idx
            }));
            await api.put('/products/reorder', { positions });
        } catch (error) {
            console.error('Error saving new order:', error);
            // Revert if error? Maybe fetch products again
            const { data: productsData } = await api.get('/products');
            setProducts(productsData);
        }
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Productos</h2>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ name: '', price: '', stock: '', category: '', trackStock: true, variablePrice: false, image: '', emoji: '' });
                        setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center w-full sm:w-auto justify-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Producto
                </button>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agregar Stock</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product, index) => (
                            <tr
                                key={product._id}
                                draggable
                                onDragStart={(e) => onDragStart(e, index)}
                                onDragOver={(e) => onDragOver(e, index)}
                                onDrop={(e) => onDrop(e, index)}
                                onDragEnd={() => {
                                    setDraggedItemIndex(null);
                                    setDragOverIndex(null);
                                }}
                                className={`${draggedItemIndex === index ? 'opacity-50' : ''} ${dragOverIndex === index ? 'bg-blue-50 border-t-2 border-blue-400' : ''} transition-all duration-200`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center cursor-move" title="Arrastra para reordenar">
                                        {product.image ? (
                                            <img className="h-10 w-10 rounded-full object-cover mr-3" src={product.image} alt="" />
                                        ) : (
                                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-xl">
                                                {product.emoji || '📦'}
                                            </div>
                                        )}
                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.variablePrice ? 'Variable' : `$${product.price}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {product.trackStock ? product.stock : '∞'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {product.trackStock ? (
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-20 p-1 border rounded text-sm"
                                                placeholder="Cant."
                                                value={stockToAdd[product._id] || ''}
                                                onChange={(e) => setStockToAdd({ ...stockToAdd, [product._id]: e.target.value })}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleAddStock(product._id);
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={() => handleAddStock(product._id)}
                                                className="text-green-600 hover:text-green-900 p-1"
                                                title="Agregar stock"
                                            >
                                                <PlusCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 text-sm">N/A</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {products.map((product, index) => (
                    <div
                        key={product._id}
                        className={`bg-white shadow-md rounded-lg p-4 transition-all duration-200 ${draggedItemIndex === index ? 'opacity-50' : ''} ${dragOverIndex === index ? 'ring-2 ring-blue-400 transform scale-102' : ''}`}
                        draggable
                        onDragStart={(e) => onDragStart(e, index)}
                        onDragOver={(e) => onDragOver(e, index)}
                        onDrop={(e) => onDrop(e, index)}
                        onDragEnd={() => {
                            setDraggedItemIndex(null);
                            setDragOverIndex(null);
                        }}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center flex-1 cursor-move" title="Arrastra para reordenar">
                                {product.image ? (
                                    <img className="h-12 w-12 rounded-full object-cover mr-3" src={product.image} alt="" />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mr-3 text-2xl">
                                        {product.emoji || '📦'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                    <p className="text-sm text-gray-500">{product.category}</p>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-900 p-2">
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900 p-2">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div>
                                <span className="text-gray-500">Precio:</span>
                                <p className="font-semibold text-gray-900">
                                    {product.variablePrice ? 'Variable' : `$${product.price}`}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500">Stock:</span>
                                <p className="font-semibold text-gray-900">
                                    {product.trackStock ? product.stock : '∞'}
                                </p>
                            </div>
                        </div>
                        {product.trackStock && (
                            <div className="border-t pt-3">
                                <label className="text-sm text-gray-600 mb-2 block">Agregar Stock:</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="number"
                                        min="1"
                                        className="flex-1 p-2 border rounded text-sm"
                                        placeholder="Cantidad"
                                        value={stockToAdd[product._id] || ''}
                                        onChange={(e) => setStockToAdd({ ...stockToAdd, [product._id]: e.target.value })}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddStock(product._id);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => handleAddStock(product._id)}
                                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                                        title="Agregar stock"
                                    >
                                        <PlusCircle className="w-5 h-5 mr-1" />
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 md:p-8 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Nombre</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Categoría</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={formData.category}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Emoji (Opcional)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded"
                                        value={formData.emoji}
                                        onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                                        placeholder="Ej: 🍔"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, emoji: '🍔' })} // Example quick pick
                                        className="p-2 border rounded hover:bg-gray-100"
                                        title="Ejemplo"
                                    >
                                        🍔
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Se mostrará si no hay imagen.</p>
                            </div>
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={formData.variablePrice}
                                        onChange={(e) => setFormData({ ...formData, variablePrice: e.target.checked })}
                                    />
                                    <span className="text-sm font-bold text-gray-700">Precio Variable</span>
                                </label>
                            </div>
                            {!formData.variablePrice && (
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Precio</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full p-2 border rounded"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required={!formData.variablePrice}
                                    />
                                </div>
                            )}
                            <div className="mb-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="mr-2"
                                        checked={formData.trackStock}
                                        onChange={(e) => setFormData({ ...formData, trackStock: e.target.checked })}
                                    />
                                    <span className="text-sm font-bold text-gray-700">Controlar Stock</span>
                                </label>
                            </div>
                            {formData.trackStock && (
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Stock</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                        required={formData.trackStock}
                                    />
                                </div>
                            )}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">URL de Imagen o GIF (ej. Imgur, Giphy)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={formData.image}
                                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    placeholder="https://media.giphy.com/media/..."
                                />
                                {formData.image && (
                                    <div className="mt-2 flex justify-center p-2 bg-gray-50 rounded border border-dashed border-gray-300">
                                        <img
                                            src={formData.image}
                                            alt="Vista previa"
                                            className="h-32 object-contain rounded"
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Soporta imágenes estáticas y GIFs animados. Se mostrará en lugar del emoji.
                                </p>
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

export default ProductsPage;
