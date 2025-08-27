import React, { ReactNode } from 'react';
import { XIcon } from './Icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: ReactNode;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div
                className={`p-[1px] bg-gradient-to-b from-gray-600/50 to-gray-800/30 rounded-xl w-full ${sizeClasses[size]} transform transition-all duration-300 ease-in-out scale-95 animate-modal-in`}
                onClick={e => e.stopPropagation()}
            >
                <div className="bg-gray-800/90 rounded-xl shadow-2xl w-full flex flex-col">
                    <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-700/50">
                        <h2 className="text-xl font-bold text-white">{title}</h2>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                            <XIcon className="w-6 h-6 text-gray-400" />
                        </button>
                    </div>
                    <div className="p-6 overflow-y-auto max-h-[85vh] modal-content">
                        {children}
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes modal-in {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-modal-in { animation: modal-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Modal;
