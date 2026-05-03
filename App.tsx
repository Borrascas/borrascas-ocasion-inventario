import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Header from './components/Header';
import ToastContainer from './components/ui/Toast';
import InstallPrompt from './components/ui/InstallPrompt';
import { Toast } from './types';
import Loaners from './components/Loaners';
import { AlertCircleIcon } from './components/ui/Icons';
import Settings from './components/Settings';
import { supabase } from './services/supabaseClient';
import Auth from './components/Auth';
import PendingApproval from './components/PendingApproval';
import { queryClient } from './services/queryClient';
import { Session } from '@supabase/supabase-js';
import { useUserPermissions } from './services/userService';
import { useInstallPrompt } from './services/useInstallPrompt';
import { UserRole } from './types';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-950" style={{ height: '-webkit-fill-available' }}>
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full" style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(99, 102, 241, 0.1) 25%, rgba(59, 130, 246, 0.4) 50%, rgba(56, 189, 248, 0.8) 75%, transparent 100%)',
                    animation: 'spin-gradient 1s linear infinite',
                }} />
                <div className="absolute inset-[3px] rounded-full bg-slate-950" />
                <div className="absolute inset-0 rounded-full" style={{
                    background: 'conic-gradient(from 0deg, transparent 70%, rgba(56, 189, 248, 0.6) 100%)',
                    animation: 'spin-gradient 1s linear infinite',
                }} />
                <div className="absolute inset-[3px] rounded-full bg-slate-950" />
            </div>
            <p className="mt-5 text-sm text-gray-500 tracking-wide font-medium">Cargando...</p>
        </div>
    );
};

const AuthenticatedApp: React.FC<{ session: Session }> = ({ session }) => {
    const { permissions, userProfile, loading } = useUserPermissions();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);
    const { showInstallPrompt, installApp, dismissPrompt } = useInstallPrompt();

    const showToast = useCallback((message: string, options: { type?: 'success' | 'error', icon?: React.ReactNode | null } = {}) => {
        const { type = 'success', icon: rawIcon } = options;
        const id = new Date().getTime().toString();
        
        let icon: React.ReactNode | null | undefined = rawIcon;

        if (type === 'error' && typeof rawIcon === 'undefined') {
            icon = <AlertCircleIcon className="w-6 h-6 text-red-500" />;
        }
        
        if (typeof icon === 'string') {
            icon = <span className="text-xl">{icon}</span>;
        }

        setToasts(prev => [...prev, { id, message, type, icon }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 5000);
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    // Si el usuario no tiene permisos o está pendiente
    if (!permissions?.canView || userProfile?.role === UserRole.Pending) {
        return <PendingApproval userProfile={userProfile} />;
    }

    return (
        <QueryClientProvider client={queryClient}>
            <HashRouter>
                <ToastContainer toasts={toasts} />
                {showInstallPrompt && (
                    <InstallPrompt 
                        onInstall={installApp}
                        onDismiss={dismissPrompt}
                    />
                )}
                <div className="flex min-h-screen bg-slate-950 text-gray-100" style={{ minHeight: '-webkit-fill-available' }}>
                    <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} permissions={permissions} showToast={showToast} />
                    <div className="flex-1 flex flex-col">
                        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                        <main className="flex-1 p-4 md:p-6 lg:p-8" style={{ background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0.8) 100%)' }}>
                            <Routes>
                                <Route path="/" element={<Navigate to="/inventory" replace />} />
                                <Route path="/dashboard" element={<Dashboard permissions={permissions} />} />
                                <Route path="/inventory" element={<Inventory showToast={showToast} permissions={permissions} />} />
                                <Route path="/loaners" element={<Loaners permissions={permissions} showToast={showToast} />} />
                                <Route path="/settings" element={<Settings permissions={permissions} userProfile={userProfile} />} />
                            </Routes>
                        </main>
                    </div>
                </div>
            </HashRouter>
        </QueryClientProvider>
    );
};

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching session:', error);
                setIsLoading(false);
            }
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!session) {
        return <Auth />;
    }
    
    return <AuthenticatedApp session={session} />;
};

export default App;
