import React from 'react';
import { Lock, Calendar, Phone } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const LicenseExpiredPage = () => {
    const { user, logout } = useAuthStore();

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>

                <div className="mx-auto bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                    <Lock className="w-10 h-10 text-red-600" />
                </div>

                <h1 className="text-3xl font-bold text-gray-800 mb-2">Licencia Vencida</h1>
                <p className="text-gray-500 mb-6">
                    El periodo de acceso para el usuario <span className="font-semibold text-gray-700">{user?.username}</span> ha finalizado.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
                    <div className="flex items-center justify-center text-gray-600 mb-2">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="text-sm">Fecha de expiración:</span>
                    </div>
                    <p className="text-lg font-bold text-red-600">
                        {user?.licenseExpiresAt ? new Date(user.licenseExpiresAt).toLocaleDateString() : 'Desconocida'}
                    </p>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Para renovar tu acceso, por favor contacta al administrador del sistema o soporte técnico.
                    </p>

                    <div className="flex items-center justify-center space-x-2 text-blue-600 font-medium">
                        <Phone className="w-4 h-4" />
                        <span>+1 234 567 890</span>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors mt-4"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LicenseExpiredPage;
