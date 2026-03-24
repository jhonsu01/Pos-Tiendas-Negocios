import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Home, ShoppingCart, Package, DollarSign, LogOut, Settings, FolderTree, TrendingUp, Calculator, Users, Menu, X, UserCog, ClipboardList, Database, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/axios';

const DashboardPage = () => {
    const { user, logout } = useAuthStore();
    const { isDarkMode, toggleTheme } = useThemeStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [settings, setSettings] = useState({ storeName: 'POS Moderno', storeLogo: '', logoSize: 80 });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                setSettings(data);
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };
        fetchSettings();
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/', icon: Home, label: 'Inicio' },
        { path: '/pos', icon: ShoppingCart, label: 'Sistema POS' },
        { path: '/products', icon: Package, label: 'Productos' },
        { path: '/sales', icon: DollarSign, label: 'Historial Ventas' },
        { path: '/registers', icon: Package, label: 'Cajas' },
        { path: '/transfers', icon: ClipboardList, label: 'Traslados / Deudas' },
        { path: '/cash-closure', icon: Calculator, label: 'Cierre de Caja' },
        { path: '/suppliers', icon: Users, label: 'Proveedores' },
        { path: '/categories', icon: FolderTree, label: 'Categorías' },
        { path: '/users', icon: UserCog, label: 'Usuarios' },
        { path: '/settings', icon: Settings, label: 'Configuración' },
        { path: '/backups', icon: Database, label: 'Respaldos' },
    ];

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-md z-50 px-4 py-3 flex items-center justify-between transition-colors duration-200">
                <div className="flex items-center">
                    {settings.storeLogo ? (
                        <img
                            src={settings.storeLogo}
                            alt={settings.storeName}
                            style={{ height: '40px' }}
                            className="object-contain"
                        />
                    ) : (
                        <h1 className="text-lg font-bold text-blue-600 dark:text-blue-400">{settings.storeName}</h1>
                    )}
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar - Desktop & Mobile Overlay */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-64 bg-white dark:bg-gray-800 shadow-md
                transform transition-all duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Desktop Header */}
                <div className="p-6 hidden lg:flex flex-col items-center">
                    {settings.storeLogo ? (
                        <div className="flex justify-center mb-2">
                            <img
                                src={settings.storeLogo}
                                alt={settings.storeName}
                                style={{ height: `${settings.logoSize || 80}px` }}
                                className="object-contain transition-all duration-200"
                            />
                        </div>
                    ) : (
                        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 text-center mb-2">{settings.storeName}</h1>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center w-full">
                        Hola, <span className="font-semibold text-gray-700 dark:text-gray-200">{user?.name || user?.username}</span> 👋
                    </p>

                    {/* Dark Mode Toggle */}
                    <div
                        onClick={toggleTheme}
                        className="mt-4 flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 cursor-pointer w-36 relative transition-colors duration-300 border border-gray-300 dark:border-gray-600 shadow-inner"
                    >
                        <div className={`w-8 h-8 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center
                            ${isDarkMode ? 'translate-x-[6.5rem] bg-gray-800' : 'translate-x-0 bg-white'}
                         `}>
                            {isDarkMode ? <Moon className="w-4 h-4 text-blue-300" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <span className={`absolute left-0 right-0 text-center text-xs font-bold pointer-events-none transition-colors duration-300 ${isDarkMode ? 'text-gray-200 pr-8' : 'text-gray-700 pl-8'}`}>
                            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        </span>
                    </div>
                </div>

                {/* Mobile Header Inside Sidebar */}
                <div className="p-6 lg:hidden border-b dark:border-gray-700 flex flex-col items-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
                        Hola, <span className="font-semibold text-gray-700 dark:text-gray-200">{user?.name || user?.username}</span> 👋
                    </p>
                    {/* Dark Mode Toggle Mobile */}
                    <div
                        onClick={toggleTheme}
                        className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 cursor-pointer w-36 relative transition-colors duration-300 border border-gray-300 dark:border-gray-600 shadow-inner"
                    >
                        <div className={`w-8 h-8 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center
                            ${isDarkMode ? 'translate-x-[6.5rem] bg-gray-800' : 'translate-x-0 bg-white'}
                         `}>
                            {isDarkMode ? <Moon className="w-4 h-4 text-blue-300" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                        </div>
                        <span className={`absolute left-0 right-0 text-center text-xs font-bold pointer-events-none transition-colors duration-300 ${isDarkMode ? 'text-gray-200 pr-8' : 'text-gray-700 pl-8'}`}>
                            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="mt-6 overflow-y-auto h-[calc(100vh-250px)] lg:h-[calc(100vh-280px)]">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-6 py-3 transition-colors ${isActive
                                    ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400 border-r-4 border-orange-500 dark:border-orange-400 font-bold'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 hover:text-orange-500 dark:hover:text-orange-400'
                                    }`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.label}
                            </Link>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-6 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mt-4"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        Cerrar Sesión
                    </button>
                </nav>
            </div>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pt-20 lg:pt-8 bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
                <Outlet />
            </div>
        </div>
    );
};

export default DashboardPage;
