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
                className={`w-full max-w-md rounded-t-2xl shadow-2xl p-4 ${isOpen ? 'animate-sheet-in' : 'animate-sheet-out'}`}
                onAnimationEnd={handleAnimationEnd}
                style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    borderTop: '1px solid rgba(51, 65, 85, 0.5)',
                    borderLeft: '1px solid rgba(51, 65, 85, 0.3)',
                    borderRight: '1px solid rgba(51, 65, 85, 0.3)',
                }}
            >
                <div className="mx-auto w-10 h-1 flex-shrink-0 rounded-full mb-4" 
                     style={{ background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.4), rgba(56, 189, 248, 0.4))' }} />
                {children}
            </div>
        </div>
    );
};

export default ActionSheet;
