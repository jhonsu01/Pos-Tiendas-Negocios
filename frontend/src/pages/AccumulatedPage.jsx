import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { DollarSign, TrendingUp, Calendar, Package } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const AccumulatedPage = () => {
    const [accumulated, setAccumulated] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAccumulated();
    }, []);

    const fetchAccumulated = async () => {
        try {
            const { data } = await api.get('/registers/accumulated');
            setAccumulated(data);
        } catch (error) {
            console.error('Error fetching accumulated:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalAccumulated = accumulated.reduce((sum, item) => sum + item.accumulatedCash, 0);
    const totalSales = accumulated.reduce((sum, item) => sum + item.totalSales, 0);

    if (loading) {
        return <div className="text-center py-10">Cargando...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Acumulados por Caja</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">Total Acumulado</p>
                            <h3 className="text-3xl font-bold mt-2">{formatCurrency(totalAccumulated)}</h3>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-full p-3">
                            <DollarSign className="w-8 h-8" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Ventas</p>
                            <h3 className="text-3xl font-bold mt-2">{formatCurrency(totalSales)}</h3>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-full p-3">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Register Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accumulated.map((item) => (
                    <div key={item.register._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">{item.register.name}</h3>
                            <Package className="w-6 h-6 text-blue-500" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Dinero Acumulado:</span>
                                <span className="text-lg font-bold text-green-600">
                                    {formatCurrency(item.accumulatedCash)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total Ventas:</span>
                                <span className="text-md font-semibold text-blue-600">
                                    {formatCurrency(item.totalSales)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Saldo Final Total:</span>
                                <span className="text-md font-semibold text-gray-700">
                                    {formatCurrency(item.totalClosingBalance)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Saldo Inicial Total:</span>
                                <span className="text-md font-semibold text-gray-700">
                                    {formatCurrency(item.totalOpeningBalance)}
                                </span>
                            </div>

                            {item.totalPayments > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Pagos a Proveedores:</span>
                                    <span className="text-md font-semibold text-red-600">
                                        -{formatCurrency(item.totalPayments)}
                                    </span>
                                </div>
                            )}

                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Número de Cierres:</span>
                                    <span className="text-md font-semibold text-gray-700">
                                        {item.closureCount}
                                    </span>
                                </div>
                            </div>

                            {item.lastClosure && (
                                <div className="flex items-center text-xs text-gray-500 mt-2">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Último cierre: {new Date(item.lastClosure).toLocaleDateString('es-CO')}
                                </div>
                            )}

                            {item.register.categories && item.register.categories.length > 0 && (
                                <div className="mt-3">
                                    <p className="text-xs text-gray-500 mb-1">Categorías:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {item.register.categories.map((cat, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {accumulated.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    No hay datos de cierres aún. Realiza algunos cierres de caja para ver los acumulados.
                </div>
            )}
        </div>
    );
};

export default AccumulatedPage;
