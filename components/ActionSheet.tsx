import React, { ReactNode, useEffect, useState } from 'react';

interface ActionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

const ActionSheet: React.FC<ActionSheetProps> = ({ isOpen, onClose, children }) => {
    const [isRendered, setIsRendered] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
        }
    }, [isOpen]);

    const handleAnimationEnd = () => {
        if (!isOpen) {
            setIsRendered(false);
        }
    };

    if (!isRendered) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>
            
            {/* Sheet */}
            <div
                className={`w-full max-w-md bg-gray-800 border-t border-gray-700/50 rounded-t-2xl shadow-2xl p-4 ${isOpen ? 'animate-sheet-in' : 'animate-sheet-out'}`}
                onAnimationEnd={handleAnimationEnd}
            >
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-600 mb-4" />
                {children}
            </div>
        </div>
    );
};

export default ActionSheet;
