import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const useInstallPrompt = () => {
    const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Verificar si ya está instalada
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInWebAppiOS = (window.navigator as any).standalone === true;
        
        if (isStandalone || isInWebAppiOS) {
            setIsInstalled(true);
            return;
        }

        // Verificar si ya se rechazó antes
        const hasBeenDismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedUntil = hasBeenDismissed ? new Date(hasBeenDismissed) : null;
        
        if (dismissedUntil && dismissedUntil > new Date()) {
            return;
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            const promptEvent = e as BeforeInstallPromptEvent;
            setInstallPromptEvent(promptEvent);
            
            // Mostrar el prompt después de un pequeño delay
            setTimeout(() => {
                setShowInstallPrompt(true);
            }, 3000);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setShowInstallPrompt(false);
            setInstallPromptEvent(null);
            localStorage.removeItem('pwa-install-dismissed');
        };

        // Para debug: mostrar siempre en desarrollo
        if (window.location.hostname === 'localhost') {
            setTimeout(() => {
                setShowInstallPrompt(true);
            }, 2000);
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const installApp = async () => {
        if (!installPromptEvent) {
            // Si no hay evento, mostrar instrucciones manuales
            alert('Para instalar la app:\n\nChrome/Edge: Busca el ícono de instalación en la barra de direcciones\niOS Safari: Toca "Compartir" > "Añadir a pantalla de inicio"');
            return;
        }

        try {
            await installPromptEvent.prompt();
            const result = await installPromptEvent.userChoice;
            
            if (result.outcome === 'accepted') {
                setIsInstalled(true);
            }
            
            setShowInstallPrompt(false);
            setInstallPromptEvent(null);
        } catch (error) {
            console.error('Error durante la instalación:', error);
        }
    };

    const dismissPrompt = () => {
        setShowInstallPrompt(false);
        // Recordar que se rechazó por 1 día (para testing)
        const dismissedUntil = new Date();
        dismissedUntil.setDate(dismissedUntil.getDate() + 1);
        localStorage.setItem('pwa-install-dismissed', dismissedUntil.toISOString());
    };

    return {
        showInstallPrompt,
        canInstall: !!installPromptEvent,
        isInstalled,
        installApp,
        dismissPrompt
    };
};
