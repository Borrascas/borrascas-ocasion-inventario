import React from 'react';
import { NavLink } from 'react-router-dom';
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

    const handleNavClick = (item: any, e: React.MouseEvent) => {
        // Verificar permisos según la ruta
        let hasPermission = true;
        let errorMessage = "";

        switch (item.path) {
            case '/':
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
            <div className={`fixed inset-0 bg-black/60 z-30 md:hidden ${isOpen ? 'block' : 'hidden'}`} 
                 onClick={() => setIsOpen(false)}
                 style={{ 
                     WebkitTapHighlightColor: 'transparent',
                     touchAction: 'manipulation'
                 }}></div>
            <aside className={`absolute md:relative z-40 md:z-auto w-64 bg-gray-900 border-r border-gray-700/50 h-full transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
                   style={{ height: '-webkit-fill-available' }}>
                <div>
                    <div className="flex items-center justify-between p-4 border-b border-gray-700/50 h-[73px]">
                        <NavLink to="/" onClick={() => setIsOpen(false)}>
                            <img src={logoSrc} alt="Borrascas Bicicletas Ocasión Logo" className="h-full object-contain" />
                        </NavLink>
                         <button onClick={() => setIsOpen(false)} 
                                className="md:hidden p-1 rounded-full hover:bg-gray-700 active:bg-gray-600"
                                style={{ 
                                    WebkitTapHighlightColor: 'transparent',
                                    touchAction: 'manipulation'
                                }}>
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <nav className="mt-6">
                        <ul>
                            {NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const hasPermission = item.path === '/settings' || permissions.canView;
                                
                                return (
                                    <li key={item.name} className="px-4 mb-2">
                                        <NavLink
                                            to={item.path}
                                            onClick={(e) => handleNavClick(item, e)}
                                            end={item.path === '/'}
                                            className={({ isActive }) =>
                                                `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                                                    isActive
                                                        ? 'bg-blue-600 text-white shadow-lg'
                                                        : hasPermission 
                                                            ? 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                                                            : 'text-gray-500 hover:bg-gray-700/30 cursor-not-allowed opacity-60'
                                                }`
                                            }
                                        >
                                            <Icon className="w-6 h-6 mr-3" />
                                            <span className="font-medium">{item.name}</span>
                                            {!hasPermission && (
                                                <span className="ml-auto text-xs">🔒</span>
                                            )}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;