import React from 'react';
import { useLocation } from 'react-router-dom';
import { MenuIcon } from './ui/Icons';

interface HeaderProps {
    toggleSidebar: () => void;
}

const PAGE_TITLES: { [key: string]: string } = {
    '/dashboard': 'Panel de Control',
    '/inventory': 'Inventario',
    '/loaners': 'Préstamos',
    '/settings': 'Configuración',
};

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const location = useLocation();
    const currentTitle = PAGE_TITLES[location.pathname] || 'Inventario';

    return (
        <header className="flex-shrink-0" style={{ 
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(51, 65, 85, 0.3)',
        }}>
            <div className="flex items-center justify-between h-[60px] px-4 md:px-6">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden text-gray-400 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-gray-800/50 active:bg-gray-700/50 transition-colors"
                    style={{ 
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation'
                    }}
                    aria-label="Open sidebar"
                >
                    <MenuIcon className="h-5 w-5" />
                </button>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-xl font-bold tracking-tight gradient-text-blue">{currentTitle}</h1>
                </div>
                {/* User avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-blue-300 shrink-0"
                     style={{
                         background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(99, 102, 241, 0.2))',
                         border: '1px solid rgba(59, 130, 246, 0.3)',
                     }}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                </div>
            </div>
        </header>
    );
};

export default Header;