
import React from 'react';
import { Toast } from '../../types';

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
    const iconToRender = toast.icon;
    const isError = toast.type === 'error';
    const borderColor = isError ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)';
    const progressColor = isError ? 'bg-red-500' : 'bg-emerald-500';

    return (
        <div className="relative overflow-hidden rounded-xl shadow-2xl animate-toast-in"
             style={{
                 background: 'rgba(15, 23, 42, 0.85)',
                 backdropFilter: 'blur(16px)',
                 WebkitBackdropFilter: 'blur(16px)',
                 border: '1px solid rgba(148, 163, 184, 0.1)',
                 borderLeft: `3px solid ${borderColor}`,
             }}>
            <div className="p-4 flex items-center space-x-3">
                {iconToRender && <div className="flex-shrink-0">{iconToRender}</div>}
                <p className={`text-white font-medium text-sm ${!iconToRender ? 'w-full text-center' : ''}`}>{toast.message}</p>
            </div>
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-800">
                <div className={`h-full ${progressColor} toast-progress-bar`} style={{ opacity: 0.7 }} />
            </div>
        </div>
    );
};


const ToastContainer: React.FC<{ toasts: Toast[] }> = ({ toasts }) => {
    return (
        <>
            <div className="fixed top-5 right-5 z-[100] space-y-3 max-w-sm">
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
                    animation: toast-in 0.4s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
                }
            `}</style>
        </>
    );
};

export default ToastContainer;