import React from 'react';

const Loading: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            {/* Modern gradient ring spinner */}
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full" style={{
                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(99, 102, 241, 0.1) 25%, rgba(59, 130, 246, 0.4) 50%, rgba(56, 189, 248, 0.8) 75%, transparent 100%)',
                    animation: 'spin-gradient 1s linear infinite',
                }} />
                <div className="absolute inset-[3px] rounded-full bg-gray-900" />
                <div className="absolute inset-0 rounded-full" style={{
                    background: 'conic-gradient(from 0deg, transparent 70%, rgba(56, 189, 248, 0.6) 100%)',
                    animation: 'spin-gradient 1s linear infinite',
                }} />
                <div className="absolute inset-[3px] rounded-full bg-gray-800" />
            </div>
            <p className="mt-4 text-sm text-gray-500 tracking-wide">Cargando...</p>
        </div>
    );
};

export default Loading;
