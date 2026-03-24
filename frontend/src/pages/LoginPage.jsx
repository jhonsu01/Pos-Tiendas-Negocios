import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import { User, Lock, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const { data } = await api.post('/users/login', { username, password });
            login(data, data.token);
            navigate('/');
        } catch (err) {
            if (err.response?.data?.message === 'LICENSE_EXPIRED') {
                // Store in sessionStorage to persist across navigation
                sessionStorage.setItem('licenseExpiredData', JSON.stringify({
                    username: err.response.data.username || username,
                    licenseExpiresAt: err.response.data.licenseExpiresAt
                }));
                navigate('/license-expired');
            } else {
                setError(err.response?.data?.message || 'Credenciales incorrectas');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#2d1b69]">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900"></div>

                {/* Stars / Particles effect (CSS) */}
                <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'radial-gradient(white 1px, transparent 1px)',
                    backgroundSize: '50px 50px'
                }}></div>

                {/* Decorative Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>

                {/* Silhouette Mountains (CSS shapes) */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            </div>

            {/* Glassmorphism Card */}
            <div className="relative z-20 w-full max-w-md p-8 mx-4">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"></div>

                <div className="relative z-30 p-4">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold text-white mb-2 tracking-wide">Login</h2>
                        <p className="text-purple-200 text-sm">Bienvenido a tu Sistema POS</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-lg mb-6 text-sm text-center backdrop-blur-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-purple-200 group-focus-within:text-white transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-11 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 transition-all duration-300"
                                placeholder="Usuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-purple-200 group-focus-within:text-white transition-colors" />
                            </div>
                            <input
                                type="password"
                                className="block w-full pl-11 pr-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white placeholder-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white/20 transition-all duration-300"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm text-purple-200">
                            <label className="flex items-center cursor-pointer hover:text-white transition-colors">
                                <input type="checkbox" className="form-checkbox h-4 w-4 text-purple-500 rounded border-white/30 bg-white/10 focus:ring-offset-0 focus:ring-purple-400" />
                                <span className="ml-2">Recordarme</span>
                            </label>
                            <a href="#" className="hover:text-white transition-colors underline decoration-transparent hover:decoration-white">
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center py-3 px-4 bg-white text-purple-900 rounded-xl font-bold text-lg hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-purple-900 focus:ring-white transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="w-6 h-6 border-2 border-purple-900 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <>
                                    Ingresar
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-purple-200 text-sm">
                            ¿No tienes cuenta?{' '}
                            <span className="text-white font-semibold cursor-not-allowed opacity-70">
                                Contacta al administrador
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer text */}
            <div className="absolute bottom-4 text-center w-full text-purple-300/40 text-xs">
                &copy; 2025 Sistema POS. Todos los derechos reservados.
            </div>
        </div>
    );
};

export default LoginPage;
