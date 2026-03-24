import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Trash2, CheckCircle, Search, User, Package } from 'lucide-react';

const TransfersPage = () => {
    const [transfers, setTransfers] = useState([]);
    const [products, setProducts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [customerName, setCustomerName] = useState('');
    const [selectedProduct, setSelectedProduct] = useState('');
    const [qty, setQty] = useState(1);
    const [cart, setCart] = useState([]);
    const [customPrice, setCustomPrice] = useState('');

    const [registers, setRegisters] = useState([]);

    useEffect(() => {
        fetchTransfers();
        fetchProducts();
        fetchRegisters();
    }, []);

    const fetchRegisters = async () => {
        try {
            const { data } = await api.get('/registers');
            setRegisters(data);
        } catch (error) {
            console.error('Error fetching registers:', error);
        }
    };

    const fetchTransfers = async () => {
        try {
            const { data } = await api.get('/transfers');
            setTransfers(data);
        } catch (error) {
            console.error('Error fetching transfers:', error);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const handleAddToCart = () => {
        if (!selectedProduct) return;
        const product = products.find(p => p._id === selectedProduct);

        let finalPrice = product.price;
        if (product.variablePrice) {
            finalPrice = parseFloat(customPrice) || 0;
            if (finalPrice <= 0) {
                alert('Por favor ingrese un monto válido');
                return;
            }
        }

        const newItem = {
            product: product._id,
            name: product.name,
            qty: parseInt(qty),
            price: finalPrice,
            category: product.category,
            total: finalPrice * parseInt(qty)
        };

        setCart([...cart, newItem]);
        setSelectedProduct('');
        setCustomPrice('');
        setQty(1);
    };

    const handleRemoveFromCart = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0 || !customerName) return;

        const totalAmount = cart.reduce((acc, item) => acc + item.total, 0);

        try {
            await api.post('/transfers', {
                customerName,
                items: cart,
                totalAmount
            });
            setShowModal(false);
            setCustomerName('');
            setCart([]);
            fetchTransfers();
        } catch (error) {
            console.error('Error creating transfer:', error);
            alert('Error al crear traslado');
        }
    };

    const handlePay = async (id) => {
        if (window.confirm('¿Confirmar pago de esta deuda? Se registrará como una venta.')) {
            try {
                // Find an open register to assign the payment to (optional hint for backend)
                const openRegister = registers.find(r => r.status === 'open');
                const registerId = openRegister ? openRegister._id : null;

                await api.put(`/transfers/${id}/pay`, { registerId });
                fetchTransfers();
                alert('Pago registrado correctamente. El dinero se ha distribuido a las cajas correspondientes según la categoría.');
            } catch (error) {
                console.error('Error paying transfer:', error);
                alert('Error al procesar pago');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Eliminar este registro? El stock será devuelto.')) {
            try {
                await api.delete(`/transfers/${id}`);
                fetchTransfers();
            } catch (error) {
                console.error('Error deleting transfer:', error);
            }
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Traslados / Deudas</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Traslado
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transfers.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                    No hay deudas pendientes
                                </td>
                            </tr>
                        ) : (
                            transfers.map((transfer) => (
                                <tr key={transfer._id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                        {transfer.customerName}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500">
                                            {transfer.items.map((item, idx) => (
                                                <div key={idx}>
                                                    {item.qty}x {item.name} (${item.price})
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-red-600">
                                        ${transfer.totalAmount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(transfer.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                        <button
                                            onClick={() => handlePay(transfer._id)}
                                            className="bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 flex items-center"
                                            title="Pagar y Convertir a Venta"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" /> Pagar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(transfer._id)}
                                            className="text-red-600 hover:text-red-900 p-1"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Nuevo Traslado / Deuda</h3>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Nombre del Cliente</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    className="w-full pl-9 p-2 border rounded"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                        </div>

                        <div className="border-t border-b py-4 mb-4">
                            <h4 className="font-semibold mb-2">Agregar Productos</h4>
                            <div className="flex gap-2 mb-2">
                                <div className="flex-1">
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={selectedProduct}
                                        onChange={(e) => {
                                            setSelectedProduct(e.target.value);
                                            setCustomPrice('');
                                        }}
                                    >
                                        <option value="">Seleccionar Producto...</option>
                                        {products.map(p => (
                                            <option key={p._id} value={p._id}>
                                                {p.name} - ${p.price} (Stock: {p.trackStock ? p.stock : '∞'})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {products.find(p => p._id === selectedProduct)?.variablePrice && (
                                    <input
                                        type="number"
                                        className="w-32 p-2 border rounded"
                                        placeholder="Monto"
                                        value={customPrice}
                                        onChange={(e) => setCustomPrice(e.target.value)}
                                        min="0"
                                    />
                                )}
                                <input
                                    type="number"
                                    className="w-20 p-2 border rounded"
                                    value={qty}
                                    onChange={(e) => setQty(e.target.value)}
                                    min="1"
                                />
                                <button
                                    onClick={handleAddToCart}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    disabled={!selectedProduct}
                                >
                                    Agregar
                                </button>
                            </div>

                            {/* Cart Preview */}
                            <div className="bg-gray-50 p-3 rounded mt-2">
                                {cart.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center">No hay productos agregados</p>
                                ) : (
                                    <ul className="space-y-2">
                                        {cart.map((item, idx) => (
                                            <li key={idx} className="flex justify-between items-center text-sm">
                                                <span>{item.qty}x {item.name}</span>
                                                <div className="flex items-center">
                                                    <span className="font-bold mr-3">${item.total}</span>
                                                    <button onClick={() => handleRemoveFromCart(idx)} className="text-red-500">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <div className="text-xl font-bold">
                                Total: ${cart.reduce((acc, item) => acc + item.total, 0)}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                    disabled={cart.length === 0 || !customerName}
                                >
                                    Guardar Deuda
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransfersPage;
