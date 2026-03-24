import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, AlertTriangle, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import { formatCurrency } from '../utils/formatCurrency';

const HomePage = () => {
    const [stats, setStats] = useState({
        todaySales: 0,
        lowStockCount: 0,
        totalProducts: 0,
        activeRegisters: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch products to count low stock and total
                const { data: products } = await api.get('/products');
                const lowStock = products.filter(p => p.trackStock && p.stock <= 5).length;

                // Fetch registers
                const { data: registers } = await api.get('/registers');

                // Fetch today's sales (we'll sum up from all registers for a quick view)
                // This is a simplified fetch, ideally backend provides a dashboard stats endpoint
                const today = new Date().toISOString().split('T')[0];
                let todayTotal = 0;

                // We try to get summary for each register for today
                // Note: This might be heavy if many registers, but fine for now
                await Promise.all(registers.map(async (reg) => {
                    try {
                        const { data: summary } = await api.get(`/registers/${reg._id}/summary?date=${today}`);
                        todayTotal += summary.totalSales;
                    } catch (e) {
                        console.error('Error fetching summary for reg', reg._id);
                    }
                }));

                setStats({
                    todaySales: todayTotal,
                    lowStockCount: lowStock,
                    totalProducts: products.length,
                    activeRegisters: registers.length
                });

            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full">Cargando resumen...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Resumen del Día</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Ventas de Hoy */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Ventas de Hoy</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{formatCurrency(stats.todaySales)}</h3>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Productos Bajos en Stock */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Bajo Stock</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.lowStockCount}</h3>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Total Productos */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Productos</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.totalProducts}</h3>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ShoppingBag className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Cajas Activas */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Cajas Activas</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.activeRegisters}</h3>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">👋 ¡Bienvenido al Sistema POS!</h3>
                <p className="text-blue-600">
                    Selecciona una opción del menú lateral para comenzar.
                    Recuerda configurar tus <strong>Cajas</strong> y asignarles categorías para que el sistema organice las ventas automáticamente.
                </p>
            </div>
        </div>
    );
};

export default HomePage;
