import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Calendar, ArrowLeft, Phone } from 'lucide-react';

const LicenseExpiredLoginPage = () => {
    const navigate = useNavigate();
    const [licenseData, setLicenseData] = useState({ username: '', licenseExpiresAt: null });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Read from sessionStorage
        const storedData = sessionStorage.getItem('licenseExpiredData');
        if (storedData) {
            try {
                setLicenseData(JSON.parse(storedData));
            } catch (error) {
                console.error('Error parsing license data:', error);
            }
        }
        setIsLoading(false);
    }, []);

    const handleBackToLogin = () => {
        // Clear the stored data
        sessionStorage.removeItem('licenseExpiredData');
        navigate('/login');
    };

    const { username, licenseExpiresAt } = licenseData;

    if (isLoading) {
        return null; // or a loading spinner
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-30" style={{
                backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
                backgroundSize: '50px 50px'
            }}></div>

            {/* Main Card */}
            <div className="relative z-10 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl max-w-md w-full p-8 text-center">
                <div className="mx-auto bg-red-500/20 w-24 h-24 rounded-full flex items-center justify-center mb-6 border-4 border-red-500/30">
                    <Lock className="w-12 h-12 text-red-400" />
                </div>

                <h1 className="text-4xl font-bold text-white mb-3">Licencia Vencida</h1>
                <p className="text-purple-200 mb-8">
                    El acceso para este usuario ha expirado
                </p>

                {/* User Info */}
                <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
                    <div className="mb-4">
                        <p className="text-purple-300 text-sm mb-1">Usuario</p>
                        <p className="text-white text-xl font-bold">{username || 'Desconocido'}</p>
                    </div>

                    <div className="flex items-center justify-center text-red-300 mb-2">
                        <Calendar className="w-5 h-5 mr-2" />
                        <span className="text-sm font-semibold">Fecha de Expiración</span>
                    </div>
                    <p className="text-2xl font-bold text-red-400">
                        {licenseExpiresAt ? new Date(licenseExpiresAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }) : 'Desconocida'}
                    </p>
                </div>

                {/* Contact Info */}
                <div className="bg-blue-500/10 rounded-lg p-4 mb-6 border border-blue-500/20">
                    <p className="text-purple-200 text-sm mb-3">
                        Para renovar tu licencia, contacta al administrador del sistema:
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-blue-300 font-semibold">
                        <Phone className="w-4 h-4" />
                        <span>Soporte Técnico</span>
                    </div>
                </div>

                {/* Back Button */}
                <button
                    onClick={handleBackToLogin}
                    className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center border border-white/30"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Volver al Login
                </button>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 text-center w-full text-purple-300/40 text-xs">
                &copy; 2025 Sistema POS. Todos los derechos reservados.
            </div>
        </div>
    );
};

export default LicenseExpiredLoginPage;
