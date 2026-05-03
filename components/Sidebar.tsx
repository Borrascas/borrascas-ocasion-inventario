import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { XIcon } from './ui/Icons';
import { NAV_ITEMS } from '../constants';
import { UserPermissions } from '../types';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    permissions: UserPermissions;
    showToast?: (message: string, options?: { type?: 'success' | 'error', icon?: React.ReactNode | null }) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, permissions, showToast }) => {
    const logoSrc = "/logo.png";
    const location = useLocation();

    const handleNavClick = (item: any, e: React.MouseEvent) => {
        // Verificar permisos según la ruta
        let hasPermission = true;
        let errorMessage = "";

        switch (item.path) {
            case '/dashboard':
                hasPermission = permissions.canView;
                errorMessage = "No tienes permisos para ver el panel principal";
                break;
            case '/inventory':
                hasPermission = permissions.canView;
                errorMessage = "No tienes permisos para ver el inventario";
                break;
            case '/loaners':
                hasPermission = permissions.canView;
                errorMessage = "No tienes permisos para ver los préstamos";
                break;
            case '/settings':
                hasPermission = true; // Todos pueden ver configuración
                break;
            default:
                hasPermission = false;
                errorMessage = "No tienes permisos para acceder a esta sección";
        }

        if (!hasPermission) {
            e.preventDefault();
            if (showToast) {
                showToast(errorMessage, { type: 'error', icon: '🔒' });
            }
            return;
        }

        setIsOpen(false);
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                 onClick={() => setIsOpen(false)}
                 style={{ 
                     WebkitTapHighlightColor: 'transparent',
                     touchAction: 'manipulation'
                 }}></div>
            <aside className={`absolute md:relative z-40 md:z-auto w-64 h-full transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
                   style={{ 
                       height: '-webkit-fill-available',
                       background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(15, 23, 42, 0.95) 100%)',
                       borderRight: '1px solid rgba(51, 65, 85, 0.4)',
                   }}>
                <div>
                    <div className="flex items-center justify-between p-4 h-[60px]" style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
                        <NavLink to="/inventory" onClick={() => setIsOpen(false)}>
                            <img src={logoSrc} alt="Borrascas Bicicletas Ocasión Logo" className="h-full object-contain" />
                        </NavLink>
                         <button onClick={() => setIsOpen(false)} 
                                className="md:hidden p-1.5 rounded-lg hover:bg-gray-700/50 active:bg-gray-600/50 transition-colors"
                                style={{ 
                                    WebkitTapHighlightColor: 'transparent',
                                    touchAction: 'manipulation'
                                }}>
                            <XIcon className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                    <nav className="mt-6 px-3">
                        <ul className="space-y-1">
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const hasPermission = item.path === '/settings' || permissions.canView;
                                const isActive = location.pathname === item.path || 
                                    (item.path === '/inventory' && location.pathname === '/');
                                
                                return (
                                    <li key={item.name}>
                                        <NavLink
                                            to={item.path}
                                            onClick={(e) => handleNavClick(item, e)}
                                            end={item.path === '/'}
                                            className={
                                                `flex items-center p-3 rounded-xl transition-all duration-200 group ${
                                                    isActive
                                                        ? 'nav-active-glow text-white font-semibold'
                                                        : hasPermission 
                                                            ? 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                                                            : 'text-gray-600 hover:bg-gray-800/30 cursor-not-allowed opacity-60'
                                                }`
                                            }
                                        >
                                            <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-400'}`} />
                                            <span className="text-sm">{item.name}</span>
                                            {!hasPermission && (
                                                <span className="ml-auto text-xs opacity-50">🔒</span>
                                            )}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
                {/* Bottom decoration */}
                <div className="mt-auto p-4">
                    <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(51, 65, 85, 0.4), transparent)' }} />
                    <p className="text-center text-xs text-gray-600 mt-3 tracking-wider">BORRASCAS OCASIÓN</p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;