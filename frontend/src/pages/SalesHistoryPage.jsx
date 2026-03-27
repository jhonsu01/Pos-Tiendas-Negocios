import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const SalesHistoryPage = () => {
    const [sales, setSales] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSale, setEditingSale] = useState(null);
    const [editData, setEditData] = useState({
        totalAmount: '',
        paymentMethod: '',
    });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const { data } = await api.get('/sales');
            setSales(data);
        } catch (error) {
            console.error('Error fetching sales:', error);
        }
    };

    // Filter sales by date range
    const filteredSales = sales.filter((sale) => {
        if (!startDate && !endDate) return true;

        // Get sale date in local timezone (year, month, day only)
        const saleDate = new Date(sale.createdAt);
        const saleDateOnly = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());

        // Parse filter dates
        const start = startDate ? new Date(startDate + 'T00:00:00') : null;
        const end = endDate ? new Date(endDate + 'T23:59:59') : null;

        if (start && end) {
            return saleDateOnly >= new Date(start.getFullYear(), start.getMonth(), start.getDate()) &&
                saleDateOnly <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
        } else if (start) {
            return saleDateOnly >= new Date(start.getFullYear(), start.getMonth(), start.getDate());
        } else if (end) {
            return saleDateOnly <= new Date(end.getFullYear(), end.getMonth(), end.getDate());
        }
        return true;
    });

    // Calculate total sales for filtered period
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);

    const handleEdit = (sale) => {
        setEditingSale(sale);
        setEditData({
            totalAmount: sale.totalAmount,
            paymentMethod: sale.paymentMethod,
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/sales/${editingSale._id}`, {
                items: editingSale.items,
                totalAmount: parseFloat(editData.totalAmount),
                paymentMethod: editData.paymentMethod,
            });
            alert('Venta actualizada exitosamente');
            setShowEditModal(false);
            setEditingSale(null);
            fetchSales();
        } catch (error) {
            console.error('Error updating sale:', error);
            alert('Error al actualizar la venta');
        }
    };

    const handleDelete = async (saleId) => {
        if (window.confirm('¿Estás seguro de eliminar esta venta? Esta acción restaurará el stock y no se puede deshacer.')) {
            try {
                await api.delete(`/sales/${saleId}`);
                alert('Venta eliminada exitosamente');
                fetchSales();
            } catch (error) {
                console.error('Error deleting sale:', error);
                alert('Error al eliminar la venta');
            }
        }
    };

    return (
        <div className="p-4 md:p-0">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Historial de Ventas</h2>

            {/* Date Filter and Summary */}
            <div className="bg-white shadow-md rounded-lg p-4 mb-4">
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                    {/* Date Filters */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Fecha Desde
                            </label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Fecha Hasta
                            </label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {(startDate || endDate) && (
                        <button
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                            }}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-semibold transition"
                        >
                            Limpiar Filtros
                        </button>
                    )}
                </div>

                {/* Sales Summary */}
                <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded">
                            <p className="text-xs text-gray-600 mb-1">Total Ventas</p>
                            <p className="text-xl font-bold text-blue-600">{filteredSales.length}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded">
                            <p className="text-xs text-gray-600 mb-1">Monto Total</p>
                            <p className="text-xl font-bold text-green-600">{formatCurrency(totalSales)}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded col-span-2 md:col-span-1">
                            <p className="text-xs text-gray-600 mb-1">Promedio por Venta</p>
                            <p className="text-xl font-bold text-purple-600">
                                {filteredSales.length > 0 ? formatCurrency(totalSales / filteredSales.length) : '$0'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cajero</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artículos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pago</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSales.map((sale) => (
                            <tr key={sale._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(sale.createdAt).toLocaleString('es-CO')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {sale.user?.name || 'Desconocido'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <ul className="list-disc list-inside">
                                        {sale.items.map((item, idx) => (
                                            <li key={idx}>
                                                {item.qty}x {item.name} ({formatCurrency(item.price)})
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                    {formatCurrency(sale.totalAmount)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {sale.paymentMethod}
                                    {sale.isTransferPayment && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Pago de Deuda
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(sale)}
                                        className="text-blue-600 hover:text-blue-900"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(sale._id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Eliminar"
                                    >
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
                {filteredSales.map((sale) => (
                    <div key={sale._id} className="bg-white shadow-md rounded-lg p-4">
                        {/* Header con fecha y cajero */}
                        <div className="flex justify-between items-start mb-3 pb-3 border-b">
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Fecha</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {new Date(sale.createdAt).toLocaleDateString('es-CO')}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {new Date(sale.createdAt).toLocaleTimeString('es-CO')}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 mb-1">Cajero</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {sale.user?.name || 'Desconocido'}
                                </p>
                            </div>
                        </div>

                        {/* Artículos */}
                        <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-2 font-semibold">Artículos:</p>
                            <ul className="space-y-1">
                                {sale.items.map((item, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex justify-between">
                                        <span>{item.qty}x {item.name}</span>
                                        <span className="font-semibold">{formatCurrency(item.price)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Total y método de pago */}
                        <div className="grid grid-cols-2 gap-3 mb-3 pt-3 border-t">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Método de Pago</p>
                                <p className="text-sm font-semibold text-gray-900">
                                    {sale.paymentMethod === 'Cash' ? 'Efectivo' :
                                        sale.paymentMethod === 'Card' ? 'Tarjeta' :
                                            sale.paymentMethod === 'Transfer' ? 'Transferencia' :
                                                sale.paymentMethod}
                                    {sale.isTransferPayment && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                            Pago de Deuda
                                        </span>
                                    )}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 mb-1">Total</p>
                                <p className="text-lg font-bold text-green-600">
                                    {formatCurrency(sale.totalAmount)}
                                </p>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex space-x-2 pt-3 border-t">
                            <button
                                onClick={() => handleEdit(sale)}
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                            </button>
                            <button
                                onClick={() => handleDelete(sale._id)}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center justify-center"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de Edición */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 md:p-8 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">Editar Venta</h3>
                        <form onSubmit={handleUpdate}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Artículos</label>
                                <ul className="list-disc list-inside bg-gray-50 p-3 rounded">
                                    {editingSale.items.map((item, idx) => (
                                        <li key={idx} className="text-sm text-gray-700">
                                            {item.qty}x {item.name} - {formatCurrency(item.price)}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-xs text-gray-500 mt-1">
                                    Los artículos no se pueden modificar. Solo puedes ajustar el total y método de pago.
                                </p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Total</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                    value={editData.totalAmount}
                                    onChange={(e) => setEditData({ ...editData, totalAmount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Método de Pago</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={editData.paymentMethod}
                                    onChange={(e) => setEditData({ ...editData, paymentMethod: e.target.value })}
                                    required
                                >
                                    <option value="Cash">Efectivo</option>
                                    <option value="Card">Tarjeta</option>
                                    <option value="Transfer">Transferencia</option>
                                </select>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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

export default SalesHistoryPage;
