import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useCartStore } from '../store/cartStore';
import { Search, ShoppingCart, Trash2, Plus, Minus, ScanBarcode } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const PosPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { cartItems, addToCart, removeFromCart, updateQty, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);
    const [showPriceModal, setShowPriceModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [customPrice, setCustomPrice] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [registers, setRegisters] = useState([]);
    const [selectedRegister, setSelectedRegister] = useState('');
    const [barcodeInput, setBarcodeInput] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes, registersRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories'),
                    api.get('/registers'),
                ]);
                setProducts(productsRes.data);
                setCategories(categoriesRes.data);
                setRegisters(registersRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = products.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const change = amountPaid ? parseFloat(amountPaid) - totalAmount : 0;

    const handleAddToCart = (product) => {
        if (product.variablePrice) {
            setSelectedProduct(product);
            setCustomPrice('');
            setShowPriceModal(true);
        } else {
            addToCart(product);
        }
    };

    const handleBarcodeSubmit = (e) => {
        e.preventDefault();
        if (!barcodeInput) return;

        const product = products.find(p => p.sku === barcodeInput || p.sku === barcodeInput.toUpperCase());

        if (product) {
            handleAddToCart(product);
            setBarcodeInput(''); // Clear input for next scan
        } else {
            alert('Producto no encontrado con SKU: ' + barcodeInput);
            setBarcodeInput('');
        }
    };

    const handleConfirmPrice = () => {
        if (customPrice && parseFloat(customPrice) > 0) {
            addToCart({ ...selectedProduct, price: parseFloat(customPrice) });
            setShowPriceModal(false);
            setSelectedProduct(null);
            setCustomPrice('');
        }
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        setLoading(true);
        try {
            let assignedRegister = null;

            const cartCategories = [...new Set(cartItems.map(item => {
                const product = products.find(p => p._id === item.product);
                return product?.category;
            }).filter(Boolean))];

            for (const reg of registers) {
                if (reg.categories && reg.categories.length > 0) {
                    const hasMatchingCategory = cartCategories.some(cat =>
                        reg.categories.includes(cat)
                    );
                    if (hasMatchingCategory) {
                        assignedRegister = reg._id;
                        break;
                    }
                }
            }

            if (!assignedRegister) {
                assignedRegister = selectedRegister || (registers.length > 0 ? registers[0]._id : null);
            }

            if (!assignedRegister) {
                alert('No hay cajas disponibles. Por favor crea una caja primero.');
                setLoading(false);
                return;
            }

            await api.post('/sales', {
                items: cartItems,
                totalAmount,
                paymentMethod: 'Cash',
                register: assignedRegister,
            });
            clearCart();
            setAmountPaid('');
            alert('Sale completed successfully!');
        } catch (error) {
            console.error('Error processing sale:', error);
            alert('Failed to process sale');
        } finally {
            setLoading(false);
        }
    };

    const getProductEmoji = (category) => {
        const emojiMap = {
            'Recargas': '📱',
            'Impresiones': '🖨️',
            'Nevera': '🧊',
            'Bebidas': '🥤',
            'Snacks': '🍿',
            'Comida': '🍔',
            'Dulces': '🍬',
            'Papelería': '📝',
            'Tecnología': '💻',
            'Ropa': '👕',
            'Juguetes': '🧸',
            'Libros': '📚',
            'Deportes': '⚽',
            'Hogar': '🏠',
            'Belleza': '💄',
            'Salud': '💊',
            'Mascotas': '🐾',
            'Otros': '📦',
        };
        return emojiMap[category] || '📦';
    };

    return (
        <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-120px)] gap-4 lg:gap-6 pb-6">
            {/* Product List */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* Filters - Responsive */}
                <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-4 shrink-0">
                    <div className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 md:items-end">
                        {/* Search */}
                        <div className="md:col-span-3 relative">
                            <label className="block text-gray-700 text-xs font-bold mb-1">Buscar</label>
                            <Search className="absolute left-3 bottom-2.5 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full pl-9 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Register selector */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 text-xs font-bold mb-1">
                                Caja <span className="text-gray-400 font-normal">(Auto)</span>
                            </label>
                            <select
                                className="w-full p-2 border rounded-lg text-sm"
                                value={selectedRegister}
                                onChange={(e) => setSelectedRegister(e.target.value)}
                            >
                                <option value="">🤖 Auto</option>
                                {registers.map((reg) => (
                                    <option key={reg._id} value={reg._id}>
                                        {reg.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category filter */}
                        <div className="md:col-span-7">
                            <label className="block text-gray-700 text-xs font-bold mb-1">Categoría</label>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setSelectedCategory('')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1 ${selectedCategory === ''
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    🏪 <span className="hidden sm:inline">Todas</span>
                                </button>
                                {categories.map((cat) => {
                                    const emoji = getProductEmoji(cat.name);
                                    return (
                                        <button
                                            key={cat._id}
                                            onClick={() => setSelectedCategory(cat.name)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1 ${selectedCategory === cat.name
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            <span>{emoji}</span>
                                            <span className="hidden lg:inline">{cat.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Grid - Scroll on Desktop, Auto height on Mobile */}
                <div className="flex-1 lg:overflow-y-auto lg:min-h-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 pb-4">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div
                                    key={product._id}
                                    onClick={() => handleAddToCart(product)}
                                    className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition border border-transparent hover:border-blue-500 flex flex-col"
                                >
                                    <div className="h-24 sm:h-28 bg-gradient-to-br from-blue-50 to-blue-100 rounded mb-2 flex items-center justify-center overflow-hidden shrink-0">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-4xl sm:text-5xl">{product.emoji || getProductEmoji(product.category)}</span>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-gray-800 text-xs sm:text-sm truncate mb-1" title={product.name}>{product.name}</h3>
                                    <p className="text-xs text-gray-500 mb-auto truncate">{product.category}</p>
                                    <div className="flex justify-between items-end mt-2">
                                        <span className="text-sm sm:text-base font-bold text-blue-600">
                                            {product.variablePrice ? 'Var.' : `$${product.price}`}
                                        </span>
                                        <span className="text-xs text-gray-400 hidden sm:inline">
                                            {product.trackStock ? product.stock : '∞'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                <p>No hay productos disponibles</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cart - Sticky on Desktop, Normal flow on Mobile */}
            <div className="w-full lg:w-96 bg-white rounded-lg shadow-lg flex flex-col shrink-0 min-h-[600px] lg:h-full">
                <div className="p-3 border-b bg-gray-50 rounded-t-lg shrink-0">
                    <h2 className="text-lg font-bold flex items-center text-gray-800 mb-2">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Orden Actual
                    </h2>

                    {/* Barcode Scanner Input */}
                    <form onSubmit={handleBarcodeSubmit} className="relative">
                        <ScanBarcode className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Escanear código de barras..."
                            className="w-full pl-9 p-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={barcodeInput}
                            onChange={(e) => setBarcodeInput(e.target.value)}
                            autoFocus
                        />
                    </form>
                </div>

                {/* Items area - Uses all available space */}
                <div className="flex-1 overflow-y-auto p-3 min-h-0">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ShoppingCart className="w-12 h-12 mb-2 opacity-20" />
                            <p>Carrito vacío</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {cartItems.map((item) => (
                                <div key={item.cartItemId || item.product} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                    <div className="flex-1 min-w-0 mr-2">
                                        <h4 className="font-medium text-sm truncate" title={item.name}>{item.name}</h4>
                                        <p className="text-xs text-gray-500">{formatCurrency(item.price)} x {item.qty}</p>
                                    </div>
                                    <div className="flex items-center space-x-1 bg-white rounded border shadow-sm">
                                        <button
                                            onClick={() => updateQty(item.cartItemId || item.product, item.qty - 1)}
                                            disabled={item.qty <= 1}
                                            className="p-1 hover:bg-gray-100 disabled:opacity-50 text-gray-600"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
                                        <button
                                            onClick={() => updateQty(item.cartItemId || item.product, item.qty + 1)}
                                            className="p-1 hover:bg-gray-100 text-gray-600"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.cartItemId || item.product)}
                                        className="ml-2 text-red-400 hover:text-red-600 p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Fixed at bottom */}
                <div className="p-3 border-t bg-gray-50 rounded-b-lg shrink-0">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-gray-600 text-sm">Total a Pagar</span>
                        <span className="text-2xl font-bold text-gray-800">{formatCurrency(totalAmount)}</span>
                    </div>

                    <div className="space-y-2">
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Monto recibido"
                                className="w-full pl-7 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={amountPaid}
                                onChange={(e) => setAmountPaid(e.target.value)}
                            />
                        </div>

                        {/* Quick Amount Buttons - Larger and Full Amount */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setAmountPaid(Math.round(totalAmount).toString())}
                                className="px-2 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-bold transition text-sm"
                            >
                                Exacto
                            </button>
                            {[1000, 2000, 5000, 10000, 20000, 50000].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => {
                                        const current = parseFloat(amountPaid) || 0;
                                        setAmountPaid((current + amount).toString());
                                    }}
                                    className="px-2 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-bold transition text-sm"
                                >
                                    {formatCurrency(amount)}
                                </button>
                            ))}
                        </div>

                        {amountPaid && (
                            <div className={`p-2 rounded text-center text-sm font-medium ${parseFloat(amountPaid) >= totalAmount
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {parseFloat(amountPaid) >= totalAmount
                                    ? `Vuelto: ${formatCurrency(change)}`
                                    : `Faltan: ${formatCurrency(totalAmount - parseFloat(amountPaid))}`
                                }
                            </div>
                        )}

                        <button
                            onClick={handleCheckout}
                            disabled={cartItems.length === 0 || loading || (amountPaid && parseFloat(amountPaid) < totalAmount)}
                            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                        >
                            {loading ? 'Procesando...' : 'Cobrar'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Price Input Modal */}
            {showPriceModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-2xl transform transition-all">
                        <h3 className="text-lg font-bold mb-1 text-gray-800">Precio Variable</h3>
                        <p className="text-sm text-gray-500 mb-4">{selectedProduct?.name}</p>

                        <div className="relative mb-6">
                            <span className="absolute left-3 top-3 text-gray-500 text-lg">$</span>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full pl-8 p-3 text-lg border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={customPrice}
                                onChange={(e) => setCustomPrice(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleConfirmPrice()}
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowPriceModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmPrice}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PosPage;
