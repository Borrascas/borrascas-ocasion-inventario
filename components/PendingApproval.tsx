import React from 'react';
import { supabase } from '../services/supabaseClient';
import { UserRole } from '../types';

interface PendingApprovalProps {
    userProfile: any;
}

const PendingApproval: React.FC<PendingApprovalProps> = ({ userProfile }) => {
    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    const getPendingMessage = () => {
        if (userProfile?.role === UserRole.Pending) {
            return {
                title: "Cuenta Pendiente de Aprobación",
                message: "Tu cuenta ha sido creada exitosamente, pero está pendiente de aprobación por un administrador. Te notificaremos cuando tu cuenta sea activada.",
                icon: "⏳"
            };
        }
        
        return {
            title: "Sin Permisos de Acceso",
            message: "Tu cuenta no tiene permisos para acceder a esta aplicación. Contacta con el administrador para más información.",
            icon: "🔒"
        };
    };

    const { title, message, icon } = getPendingMessage();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="p-8 bg-gray-800/50 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fade-in text-center">
                <div className="text-6xl mb-6">{icon}</div>
                <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
                <p className="text-gray-300 mb-6 leading-relaxed">{message}</p>
                
                {userProfile?.email && (
                    <p className="text-sm text-gray-400 mb-6">
                        Cuenta: <span className="text-blue-400">{userProfile.email}</span>
                    </p>
                )}
                
                <div className="space-y-3">
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Verificar Estado
                    </button>
                    <button 
                        onClick={handleSignOut}
                        className="w-full bg-gray-600 hover:bg-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;
