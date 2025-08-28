import React from 'react';
import { MenuIcon } from './ui/Icons';

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    return (
        <header className="flex-shrink-0 bg-gray-900 border-b border-gray-700/50">
            <div className="flex items-center justify-between h-[73px] px-4 md:px-6">
                <button
                    onClick={toggleSidebar}
                    className="md:hidden text-gray-400 hover:text-white focus:outline-none active:bg-gray-700"
                    style={{ 
                        WebkitTapHighlightColor: 'transparent',
                        touchAction: 'manipulation'
                    }}
                    aria-label="Open sidebar"
                >
                    <MenuIcon className="h-6 w-6" />
                </button>
                 <div className="flex-1 text-center md:text-left text-lg font-semibold text-gray-300">
                    {/* Placeholder for page title if needed */}
                </div>
            </div>
        </header>
    );
};

export default Header;