import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { DollarSign, Calendar, Edit, Trash2, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const CashClosurePage = () => {
    const [registers, setRegisters] = useState([]);
    const [selectedRegister, setSelectedRegister] = useState('');
    const [summary, setSummary] = useState(null);
    const [closureData, setClosureData] = useState({
        openingBalance: '',
        closingBalance: '',
        notes: '',
    });
    const [closures, setClosures] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingClosure, setEditingClosure] = useState(null);
    const [editData, setEditData] = useState({
        openingBalance: '',
        closingBalance: '',
        notes: '',
    });
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [accumulated, setAccumulated] = useState([]);

    // Estados para historial global
    const [allClosures, setAllClosures] = useState([]);
    const [historyStartDate, setHistoryStartDate] = useState('');
    const [historyEndDate, setHistoryEndDate] = useState('');
    const [historyRegisterId, setHistoryRegisterId] = useState('');

    useEffect(() => {
        fetchRegisters();
        fetchAccumulated();
        fetchAllClosures();
    }, []);

    useEffect(() => {
        fetchAllClosures();
    }, [historyStartDate, historyEndDate, historyRegisterId]);

    useEffect(() => {
        if (selectedRegister) {
            fetchSummary(selectedRegister);
        }
    }, [selectedDate]);

    useEffect(() => {
        if (summary) {
            const opening = 0;
            const sales = summary.totalSales || 0;
            const closing = sales;

            setClosureData(prev => ({
                ...prev,
                openingBalance: opening,
                closingBalance: closing
            }));
        }
    }, [summary]);

    const fetchRegisters = async () => {
        try {
            const { data } = await api.get('/registers');
            setRegisters(data);
        } catch (error) {
            console.error('Error fetching registers:', error);
        }
    };

    const fetchAccumulated = async () => {
        try {
            const { data } = await api.get('/registers/accumulated');
            setAccumulated(data);
        } catch (error) {
            console.error('Error fetching accumulated:', error);
        }
    };

    const fetchSummary = async (registerId) => {
        try {
            console.log('Fetching summary for register:', registerId, 'date:', selectedDate);
            const url = `/registers/${registerId}/summary?date=${selectedDate}`;
            console.log('URL:', url);
            const { data } = await api.get(url);
            console.log('Summary data:', data);
            setSummary(data);
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

    const fetchClosures = async (registerId) => {
        try {
            const { data } = await api.get(`/registers/${registerId}/closures`);
            setClosures(data);
        } catch (error) {
            console.error('Error fetching closures:', error);
        }
    };

    const fetchAllClosures = async () => {
        try {
            let url = '/registers/closures/all?';
            if (historyStartDate) url += `startDate=${historyStartDate}&`;
            if (historyEndDate) url += `endDate=${historyEndDate}&`;
            if (historyRegisterId) url += `registerId=${historyRegisterId}`;

            const { data } = await api.get(url);
            setAllClosures(data);
        } catch (error) {
            console.error('Error fetching all closures:', error);
        }
    };

    const handleRegisterChange = (registerId) => {
        setSelectedRegister(registerId);
        if (registerId) {
            fetchSummary(registerId);
            fetchClosures(registerId);
        } else {
            setSummary(null);
            setClosures([]);
        }
    };

    const handleCloseCash = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/registers/${selectedRegister}/close`, {
                ...closureData,
                date: selectedDate,
            });
            alert('Cierre de caja realizado exitosamente');
            setClosureData({ openingBalance: '', closingBalance: '', notes: '' });
            fetchClosures(selectedRegister);
            fetchAccumulated();
            fetchAllClosures();
        } catch (error) {
            console.error('Error closing cash:', error);
            alert('Error al cerrar la caja');
        }
    };

    const handleEdit = (closure) => {
        setEditingClosure(closure);
        setEditData({
            openingBalance: closure.openingBalance,
            closingBalance: closure.closingBalance,
            notes: closure.notes || '',
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/registers/closures/${editingClosure._id}`, editData);
            alert('Cierre actualizado exitosamente');
            setShowEditModal(false);
            setEditingClosure(null);
            fetchClosures(selectedRegister);
            fetchAccumulated();
            fetchAllClosures();
        } catch (error) {
            console.error('Error updating closure:', error);
            alert('Error al actualizar el cierre');
        }
    };

    const handleDelete = async (closureId) => {
        if (window.confirm('¿Estás seguro de eliminar este cierre? Esta acción no se puede deshacer.')) {
            try {
                await api.delete(`/registers/closures/${closureId}`);
                alert('Cierre eliminado exitosamente');
                fetchClosures(selectedRegister);
                fetchAccumulated();
                fetchAllClosures();
            } catch (error) {
                console.error('Error deleting closure:', error);
                alert('Error al eliminar el cierre');
            }
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Cierre de Caja</h2>

            {/* Sección de Acumulados */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Estado Actual de Cajas (Acumulados)</h3>

                {/* Tarjetas de Resumen Total */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Total Dinero Acumulado</p>
                                <h3 className="text-2xl font-bold mt-1">
                                    {formatCurrency(accumulated.reduce((sum, item) => sum + item.accumulatedCash, 0))}
                                </h3>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-full p-2">
                                <DollarSign className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Ventas Históricas</p>
                                <h3 className="text-2xl font-bold mt-1">
                                    {formatCurrency(accumulated.reduce((sum, item) => sum + item.totalSales, 0))}
                                </h3>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-full p-2">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tarjetas por Caja */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accumulated.map((item) => (
                        <div key={item.register._id} className="bg-white rounded-lg shadow border-l-4 border-blue-500 p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h4 className="font-bold text-gray-800">{item.register.name}</h4>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    {item.closureCount} cierres
                                </span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Dinero Acumulado:</span>
                                    <span className="font-bold text-green-600">{formatCurrency(item.accumulatedCash)}</span>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Fecha del Cierre</label>
                    <div className="flex gap-2">
                        <input
                            type="date"
                            className="flex-1 p-2 border rounded"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                        {selectedRegister && (
                            <button
                                onClick={() => fetchSummary(selectedRegister)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Actualizar
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Selecciona la fecha para ver las ventas y hacer el cierre de ese día
                    </p>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Seleccionar Caja</label>
                    <select
                        className="w-full p-2 border rounded"
                        value={selectedRegister}
                        onChange={(e) => handleRegisterChange(e.target.value)}
                    >
                        <option value="">-- Seleccione una caja --</option>
                        {registers.map((reg) => (
                            <option key={reg._id} value={reg._id}>
                                {reg.name}
                            </option>
                        ))}
                    </select>
                </div>

                {summary && (
                    <div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded">
                                <div className="flex items-center mb-2">
                                    <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                                    <span className="text-sm text-gray-600">Total Ventas</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalSales)}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded">
                                <div className="flex items-center mb-2">
                                    <Calendar className="w-5 h-5 text-green-600 mr-2" />
                                    <span className="text-sm text-gray-600">Núm. Ventas</span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">{summary.salesCount}</p>
                            </div>
                        </div>

                        <form onSubmit={handleCloseCash}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Saldo Inicial</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                    value={closureData.openingBalance}
                                    onChange={(e) => setClosureData({ ...closureData, openingBalance: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Saldo Final</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                    value={closureData.closingBalance}
                                    onChange={(e) => setClosureData({ ...closureData, closingBalance: e.target.value })}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-semibold"
                            >
                                Cerrar Caja
                            </button>
                        </form>
                    </div>
                )}
            </div>



            {/* Modal de Edición */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg w-96">
                        <h3 className="text-xl font-bold mb-4">Editar Cierre</h3>
                        <form onSubmit={handleUpdate}>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Saldo Inicial</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                    value={editData.openingBalance}
                                    onChange={(e) => setEditData({ ...editData, openingBalance: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Saldo Final</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full p-2 border rounded"
                                    value={editData.closingBalance}
                                    onChange={(e) => setEditData({ ...editData, closingBalance: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
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

            <div className="border-t border-gray-200 my-8"></div>

            {/* Historial Global de Cierres */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Historial Global de Cierres</h3>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Fecha Desde</label>
                        <input
                            type="date"
                            className="w-full p-2 border rounded"
                            value={historyStartDate}
                            onChange={(e) => setHistoryStartDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Fecha Hasta</label>
                        <input
                            type="date"
                            className="w-full p-2 border rounded"
                            value={historyEndDate}
                            onChange={(e) => setHistoryEndDate(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Filtrar por Caja</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={historyRegisterId}
                            onChange={(e) => setHistoryRegisterId(e.target.value)}
                        >
                            <option value="">Todas las Cajas</option>
                            {registers.map((reg) => (
                                <option key={reg._id} value={reg._id}>
                                    {reg.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caja</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Ventas</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Inicial</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo Final</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diferencia</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {allClosures.map((closure) => {
                                const expected = closure.openingBalance + closure.totalSales;
                                const difference = closure.closingBalance - expected;
                                const hasDifference = Math.abs(difference) > 0.01;
                                return (
                                    <tr key={closure._id} className={hasDifference ? 'bg-red-50' : ''}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(closure.closedAt).toLocaleDateString('es-CO')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {closure.register?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {closure.user?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                                            {formatCurrency(closure.totalSales)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(closure.openingBalance)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(closure.closingBalance)}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${hasDifference ? 'text-red-600' : 'text-green-600'}`}>
                                            {formatCurrency(difference)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(closure)}
                                                className="text-blue-600 hover:text-blue-900"
                                                title="Editar"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(closure._id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {allClosures.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                        No se encontraron cierres con los filtros seleccionados
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CashClosurePage;
