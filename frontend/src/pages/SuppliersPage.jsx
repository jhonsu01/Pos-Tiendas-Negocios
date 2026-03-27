import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { UserPlus, DollarSign, Edit, Trash2, CreditCard } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const SuppliersPage = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [registers, setRegisters] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        phone: '',
        email: '',
        address: '',
        notes: '',
    });
    const [paymentData, setPaymentData] = useState({
        register: '',
        amount: '',
        description: '',
    });
    const [supplierPayments, setSupplierPayments] = useState([]);
    const [editingPayment, setEditingPayment] = useState(null);

    useEffect(() => {
        fetchSuppliers();
        fetchRegisters();
    }, []);

    const fetchSuppliers = async () => {
        try {
            const { data } = await api.get('/suppliers');
            setSuppliers(data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    const fetchRegisters = async () => {
        try {
            const { data } = await api.get('/registers');
            setRegisters(data);
        } catch (error) {
            console.error('Error fetching registers:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await api.put(`/suppliers/${editingSupplier._id}`, formData);
                alert('Proveedor actualizado exitosamente');
            } else {
                await api.post('/suppliers', formData);
                alert('Proveedor creado exitosamente');
            }
            setShowModal(false);
            setEditingSupplier(null);
            setFormData({ name: '', contact: '', phone: '', email: '', address: '', notes: '' });
            fetchSuppliers();
        } catch (error) {
            console.error('Error saving supplier:', error);
            alert('Error al guardar el proveedor');
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            contact: supplier.contact || '',
            phone: supplier.phone || '',
            email: supplier.email || '',
            address: supplier.address || '',
            notes: supplier.notes || '',
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
            try {
                await api.delete(`/suppliers/${id}`);
                alert('Proveedor eliminado exitosamente');
                fetchSuppliers();
            } catch (error) {
                console.error('Error deleting supplier:', error);
                alert('Error al eliminar el proveedor');
            }
        }
    };

    const handleOpenPayment = async (supplier) => {
        setSelectedSupplier(supplier);
        setPaymentData({ register: '', amount: '', description: '' });
        setShowPaymentModal(true);

        // Fetch payment history for this supplier
        try {
            const { data } = await api.get(`/suppliers/${supplier._id}/payments`);
            setSupplierPayments(data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        try {
            if (editingPayment) {
                // Update existing payment
                await api.put(`/suppliers/payments/${editingPayment._id}`, paymentData);
                alert('Pago actualizado exitosamente');
            } else {
                // Create new payment
                await api.post(`/suppliers/${selectedSupplier._id}/payment`, paymentData);
                alert('Pago registrado exitosamente');
            }

            // Refresh payment history
            const { data } = await api.get(`/suppliers/${selectedSupplier._id}/payments`);
            setSupplierPayments(data);

            // Reset form
            setEditingPayment(null);
            setPaymentData({ register: '', amount: '', description: '' });
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Error al procesar el pago');
        }
    };

    const handleEditPayment = (payment) => {
        setEditingPayment(payment);
        setPaymentData({
            register: payment.register._id,
            amount: payment.amount,
            description: payment.description || '',
        });
    };

    const handleDeletePayment = async (paymentId) => {
        if (window.confirm('¿Estás seguro de eliminar este pago? Esto afectará el acumulado de la caja.')) {
            try {
                await api.delete(`/suppliers/payments/${paymentId}`);
                alert('Pago eliminado exitosamente');

                // Refresh payment history
                const { data } = await api.get(`/suppliers/${selectedSupplier._id}/payments`);
                setSupplierPayments(data);
            } catch (error) {
                console.error('Error deleting payment:', error);
                alert('Error al eliminar el pago');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Proveedores</h2>
                <button
                    onClick={() => {
                        setEditingSupplier(null);
                        setFormData({ name: '', contact: '', phone: '', email: '', address: '', notes: '' });
                        setShowModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Nuevo Proveedor
                </button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {suppliers.map((supplier) => (
                            <tr key={supplier._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {supplier.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {supplier.contact || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {supplier.phone || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {supplier.email || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                                    <button
                                        onClick={() => handleOpenPayment(supplier)}
                                        className="text-green-600 hover:text-green-900"
                                        title="Pagar"
                                    >
                                        <CreditCard className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(supplier)}
                                        className="text-blue-600 hover:text-blue-900"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(supplier._id)}
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

            {/* Modal de Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg w-96 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
                                <label className="block text-gray-700 text-sm font-bold mb-2">Contacto</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={formData.contact}
                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border rounded"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Dirección</label>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    rows="2"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Notas</label>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingSupplier(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {editingSupplier ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Pago */}
            {showPaymentModal && selectedSupplier && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-4">
                            Pagar a {selectedSupplier.name}
                        </h3>
                        <form onSubmit={handlePayment} className="mb-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Caja *</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={paymentData.register}
                                    onChange={(e) => setPaymentData({ ...paymentData, register: e.target.value })}
                                    required
                                >
                                    <option value="">-- Seleccionar Caja --</option>
                                    {registers.map((reg) => (
                                        <option key={reg._id} value={reg._id}>
                                            {reg.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    El pago se descontará del acumulado de esta caja
                                </p>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Monto *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                    value={paymentData.amount}
                                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Descripción</label>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    rows="2"
                                    value={paymentData.description}
                                    onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                                    placeholder="Ej: Pago de mercancía del mes"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setSelectedSupplier(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    {editingPayment ? 'Actualizar Pago' : 'Registrar Pago'}
                                </button>
                            </div>
                        </form>

                        {/* Historial de Pagos */}
                        <div className="border-t pt-4">
                            <h4 className="font-bold text-gray-700 mb-3">Historial de Pagos</h4>
                            {supplierPayments.length > 0 ? (
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {supplierPayments.map((payment) => (
                                        <div key={payment._id} className="bg-gray-50 p-3 rounded">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-green-600">
                                                        {formatCurrency(payment.amount)}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        Caja: {payment.register?.name}
                                                    </p>
                                                    {payment.description && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {payment.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right flex-shrink-0 ml-4">
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(payment.paymentDate).toLocaleDateString('es-CO')}
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        {payment.user?.name}
                                                    </p>
                                                    <div className="flex space-x-2 mt-2">
                                                        <button
                                                            onClick={() => handleEditPayment(payment)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePayment(payment._id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No hay pagos registrados</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuppliersPage;
