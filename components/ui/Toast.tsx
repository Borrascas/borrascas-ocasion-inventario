
import React from 'react';
import { Toast } from '../../types';

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
    const iconToRender = toast.icon;

    return (
        <div className="bg-gray-800 border border-gray-700/50 rounded-xl shadow-lg p-4 flex items-center space-x-4 animate-toast-in">
             {iconToRender}
            <p className={`text-white font-medium ${!iconToRender ? 'w-full text-center' : ''}`}>{toast.message}</p>
        </div>
    );
};


const ToastContainer: React.FC<{ toasts: Toast[] }> = ({ toasts }) => {
    return (
        <>
            <div className="fixed top-5 right-5 z-[100] space-y-3">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} />
                ))}
            </div>
            <style>{`
                @keyframes toast-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-toast-in {
                    animation: toast-in 0.5s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
                }
            `}</style>
        </>
    );
};

export default ToastContainer;