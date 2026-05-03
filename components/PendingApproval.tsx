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
        <div className="flex items-center justify-center min-h-screen bg-slate-950 relative overflow-hidden">
            {/* Subtle background orb */}
            <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full opacity-20"
                 style={{ 
                     background: 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
                     animation: 'orb-float 10s ease-in-out infinite'
                 }} />
            
            <div className="relative z-10 w-full max-w-md mx-4 animate-scale-in">
                <div className="p-[1px] rounded-2xl" style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.3), rgba(99, 102, 241, 0.1), transparent)'
                }}>
                    <div className="glass-card-strong rounded-2xl p-8 shadow-2xl text-center">
                        <div className="text-5xl mb-6 animate-float">{icon}</div>
                        <h2 className="text-2xl font-bold text-white mb-4 tracking-tight">{title}</h2>
                        <p className="text-gray-400 mb-6 leading-relaxed text-sm">{message}</p>
                        
                        {userProfile?.email && (
                            <p className="text-sm text-gray-500 mb-6">
                                Cuenta: <span className="text-blue-400 font-medium">{userProfile.email}</span>
                            </p>
                        )}
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => window.location.reload()}
                                className="w-full btn-premium text-white font-medium py-3 px-4 rounded-xl"
                            >
                                Verificar Estado
                            </button>
                            <button 
                                onClick={handleSignOut}
                                className="w-full bg-gray-800/60 hover:bg-gray-700/60 text-gray-300 font-medium py-3 px-4 rounded-xl transition-colors border border-gray-700/30"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;
