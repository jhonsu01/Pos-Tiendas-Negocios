import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Settings as SettingsIcon, Save, Image as ImageIcon } from 'lucide-react';

const SettingsPage = () => {
    // Estados individuales para mejor control
    const [storeName, setStoreName] = useState('');
    const [storeLogo, setStoreLogo] = useState('');
    const [logoSize, setLogoSize] = useState(80);

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Cargar configuración al iniciar
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            console.log('Configuración cargada:', data);

            if (data) {
                setStoreName(data.storeName || '');
                setStoreLogo(data.storeLogo || '');
                setLogoSize(data.logoSize || 80);
            }
        } catch (error) {
            console.error('Error al cargar configuración:', error);
            // No mostramos alerta aquí para no molestar al inicio si es la primera vez
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            storeName,
            storeLogo,
            logoSize: Number(logoSize)
        };

        console.log('Enviando configuración:', payload);

        try {
            const { data } = await api.put('/settings', payload);
            console.log('Respuesta del servidor:', data);

            alert('✅ ¡Configuración guardada exitosamente!');

            // Recargar la página para que el logo del encabezado se actualice
            window.location.reload();
        } catch (error) {
            console.error('Error al guardar:', error);
            const message = error.response?.data?.message || error.message || 'Error desconocido';
            alert(`❌ Error al guardar: ${message}`);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-gray-500">Cargando configuración...</div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-6">
            <div className="flex items-center mb-8 border-b pb-4">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                    <SettingsIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Configuración de la Tienda</h2>
                    <p className="text-gray-500 text-sm">Personaliza la apariencia y datos de tu negocio</p>
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                <div className="p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Nombre de la Tienda */}
                        <div>
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="storeName">
                                Nombre de la Tienda
                            </label>
                            <input
                                id="storeName"
                                type="text"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                placeholder="Ej: Mi Supermercado"
                                required
                            />
                        </div>

                        {/* URL del Logo */}
                        <div>
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="storeLogo">
                                URL del Logo (Imagen o GIF)
                            </label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    id="storeLogo"
                                    type="url"
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    value={storeLogo}
                                    onChange={(e) => setStoreLogo(e.target.value)}
                                    placeholder="https://media.giphy.com/media/.../giphy.gif"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Pega aquí el enlace directo a tu imagen o GIF (debe terminar en .png, .jpg, .gif, etc.)
                            </p>
                        </div>

                        {/* Tamaño del Logo */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-gray-700 font-bold" htmlFor="logoSize">
                                    Tamaño del Logo
                                </label>
                                <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
                                    {logoSize}px
                                </span>
                            </div>
                            <input
                                id="logoSize"
                                type="range"
                                min="40"
                                max="200"
                                step="5"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                value={logoSize}
                                onChange={(e) => setLogoSize(e.target.value)}
                            />
                        </div>

                        {/* Vista Previa */}
                        {storeLogo && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Vista Previa</h4>
                                <div className="flex justify-center items-center h-40 bg-white rounded border border-gray-200 overflow-hidden">
                                    <img
                                        src={storeLogo}
                                        alt="Vista previa del logo"
                                        style={{ height: `${logoSize}px` }}
                                        className="object-contain"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentNode.innerHTML = `
                                                <div class="text-center p-4">
                                                    <p class="text-red-500 font-bold mb-1">Error de imagen</p>
                                                    <p class="text-xs text-gray-500">No se pudo cargar la URL. Verifica que sea un enlace directo a una imagen.</p>
                                                </div>
                                            `;
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Botón Guardar */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg shadow-md transition-all transform hover:-translate-y-0.5 flex justify-center items-center ${loading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 mr-2" />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
