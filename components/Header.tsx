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
            <div className="flex items-center justify-between h-[60px] px-4 md:px-6 relative">
                <div className="flex-none w-10">
                    <button
                        onClick={toggleSidebar}
                        className="md:hidden text-gray-400 hover:text-white focus:outline-none p-2 -ml-2 rounded-lg hover:bg-gray-800/50 active:bg-gray-700/50 transition-colors"
                        style={{ 
                            WebkitTapHighlightColor: 'transparent',
                            touchAction: 'manipulation'
                        }}
                        aria-label="Open sidebar"
                    >
                        <MenuIcon className="h-5 w-5" />
                    </button>
                </div>
                <div className="flex-1 text-center absolute left-0 right-0 pointer-events-none">
                    <h1 className="text-xl font-bold tracking-tight gradient-text-blue inline-block">{currentTitle}</h1>
                </div>
                <div className="flex-none w-10"></div>
            </div>
        </header>
    );
};

export default Header;