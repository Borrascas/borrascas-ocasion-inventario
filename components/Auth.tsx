import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { createUserProfile } from '../services/userService';
import { AlertCircleIcon } from './ui/Icons';

const Auth: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const handleAuth = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setShowConfirmation(false);

        let data, error;
        if (isLogin) {
            ({ data, error } = await supabase.auth.signInWithPassword({ email, password }));
        } else {
            ({ data, error } = await supabase.auth.signUp({ email, password }));
            
            // Si el registro fue exitoso, crear el perfil de usuario
            if (!error && data.user) {
                await createUserProfile(data.user.id, data.user.email || email);
            }
        }

        if (error) {
            setError(error.message);
        } else {
            if (!isLogin) {
                setShowConfirmation(true);
            }
        }
        setLoading(false);
    };

    const logoSrc = "/logo.png";

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-950 relative overflow-hidden">
            {/* Animated gradient orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-30"
                 style={{ 
                     background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                     animation: 'orb-float 8s ease-in-out infinite'
                 }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-20"
                 style={{ 
                     background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
                     animation: 'orb-float 10s ease-in-out infinite reverse'
                 }} />
            <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full opacity-15"
                 style={{ 
                     background: 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, transparent 70%)',
                     animation: 'orb-float 12s ease-in-out infinite 2s'
                 }} />

            {/* Login card with glassmorphism */}
            <div className="relative z-10 w-full max-w-sm mx-4 animate-scale-in">
                <div className="p-[1px] rounded-2xl" style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.1), rgba(56, 189, 248, 0.3))'
                }}>
                    <div className="glass-card-strong rounded-2xl p-8 shadow-2xl">
                        <img src={logoSrc} alt="Logo" className="h-12 mx-auto mb-6 object-contain drop-shadow-lg" />
                        {showConfirmation ? (
                            <div className="text-center animate-fade-in">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-4">Revisa tu correo</h2>
                                <p className="text-gray-300 mb-6">Hemos enviado un enlace de confirmación a tu correo electrónico.</p>
                                <button 
                                    onClick={() => {setShowConfirmation(false); setIsLogin(true);}}
                                    className="font-medium text-blue-400 hover:text-blue-300 ml-1 transition-colors"
                                >
                                   Volver a Iniciar Sesión
                                </button>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-center text-white mb-8 tracking-tight">
                                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                </h2>
                                <form onSubmit={handleAuth} className="space-y-5">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-1.5">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                required
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="block w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 transition-all duration-200"
                                                placeholder="tu@email.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1.5">
                                            Contraseña
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <input
                                                id="password"
                                                type="password"
                                                value={password}
                                                required
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="block w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 transition-all duration-200"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    {error && (
                                        <div className="flex items-start space-x-2 text-sm text-red-400 p-3 bg-red-900/20 rounded-xl border border-red-500/20 animate-fade-in">
                                            <AlertCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                    <div className="pt-1">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white btn-premium disabled:opacity-50 disabled:cursor-not-allowed tracking-wide"
                                        >
                                            {loading ? (
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Cargando...</span>
                                                </div>
                                            ) : (
                                                isLogin ? 'Entrar' : 'Registrarse'
                                            )}
                                        </button>
                                    </div>
                                </form>
                                <div className="mt-6 pt-6 border-t border-gray-700/30">
                                    <p className="text-center text-sm text-gray-500">
                                        {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}
                                        <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-semibold text-blue-400 hover:text-blue-300 ml-1.5 transition-colors">
                                            {isLogin ? 'Regístrate' : 'Inicia sesión'}
                                        </button>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;