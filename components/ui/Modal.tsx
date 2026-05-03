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
                className={`w-full ${sizeClasses[size]} transform transition-all duration-300 ease-in-out animate-modal-in`}
                onClick={e => e.stopPropagation()}
            >
                <div className="p-[1px] rounded-2xl" style={{
                    background: 'linear-gradient(180deg, rgba(51, 65, 85, 0.5) 0%, rgba(30, 41, 59, 0.2) 50%, transparent 100%)',
                }}>
                    <div className="rounded-2xl shadow-2xl w-full flex flex-col" style={{
                        background: 'rgba(15, 23, 42, 0.95)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                    }}>
                        <div className="flex-shrink-0 flex justify-between items-center p-5" style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.3)' }}>
                            <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-800/80 transition-colors group">
                                <XIcon className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[85vh] modal-content">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes modal-in {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-modal-in { animation: modal-in 0.25s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Modal;
