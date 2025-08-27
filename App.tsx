import React, { useState, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Header from './components/Header';
import ToastContainer from './components/ui/Toast';
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
import { UserRole } from './types';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center h-screen bg-gray-900">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            <div className="absolute mt-40 text-white">Cargando...</div>
        </div>
    );
};

const AuthenticatedApp: React.FC<{ session: Session }> = ({ session }) => {
    const { permissions, userProfile, loading } = useUserPermissions();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

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
                <div className="flex min-h-screen bg-gray-900 text-gray-100">
                    <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} permissions={permissions} showToast={showToast} />
                    <div className="flex-1 flex flex-col">
                        <Header toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                        <main className="flex-1 bg-gray-800 p-4 md:p-6 lg:p-8">
                            <Routes>
                                <Route path="/" element={<Dashboard permissions={permissions} />} />
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
