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
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="p-8 bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-fade-in">
                <img src={logoSrc} alt="Logo" className="h-12 mx-auto mb-6 object-contain" />
                {showConfirmation ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Revisa tu correo</h2>
                        <p className="text-gray-300 mb-6">Hemos enviado un enlace de confirmación a tu correo electrónico.</p>
                        <button 
                            onClick={() => {setShowConfirmation(false); setIsLogin(true);}}
                            className="font-medium text-blue-400 hover:text-blue-300 ml-1"
                        >
                           Volver a Iniciar Sesión
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-center text-white mb-6">
                            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                        </h2>
                        <form onSubmit={handleAuth} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    required
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    required
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            {error && (
                                <div className="flex items-start space-x-2 text-sm text-red-400 p-3 bg-red-900/30 rounded-lg">
                                    <AlertCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}
                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                >
                                    {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarse')}
                                </button>
                            </div>
                        </form>
                        <p className="mt-6 text-center text-sm text-gray-400">
                            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}
                            <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-medium text-blue-400 hover:text-blue-300 ml-1">
                                {isLogin ? 'Regístrate' : 'Inicia sesión'}
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Auth;