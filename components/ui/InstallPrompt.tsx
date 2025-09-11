import React, { useState, useEffect } from 'react';
import * as Icons from './Icons';

interface InstallPromptProps {
    onInstall: () => void;
    onDismiss: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onInstall, onDismiss }) => {
    return (
        <div className="fixed top-4 right-4 z-50 max-w-xs">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-lg shadow-2xl border border-blue-500/20 backdrop-blur-sm animate-slide-in">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icons.DownloadIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm">¡Instala la App!</h3>
                            <p className="text-blue-100 text-xs">Acceso rápido</p>
                        </div>
                    </div>
                    <button
                        onClick={onDismiss}
                        className="text-blue-100 hover:text-white hover:bg-white/10 rounded p-1 transition-colors duration-200"
                    >
                        <Icons.XIcon className="w-4 h-4" />
                    </button>
                </div>
                
                <button
                    onClick={onInstall}
                    className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-md hover:bg-blue-50 transition-colors duration-200 text-sm"
                >
                    Instalar Ahora
                </button>
            </div>
        </div>
    );
};

export default InstallPrompt;
