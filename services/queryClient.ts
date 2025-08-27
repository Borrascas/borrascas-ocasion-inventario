import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60, // Los datos se consideran obsoletos después de 1 minuto
            gcTime: 1000 * 60 * 10, // Mantener en caché durante 10 minutos
            refetchOnWindowFocus: true, // Recargar datos cuando la ventana recupera el foco
            refetchOnReconnect: true, // Recargar cuando se reconecta
            retry: (failureCount, error) => {
                // Reintentar hasta 3 veces para errores de red
                if (failureCount < 3) return true;
                return false;
            },
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
        },
        mutations: {
            retry: (failureCount, error) => {
                // Reintentar mutaciones críticas hasta 2 veces
                if (failureCount < 2) return true;
                return false;
            },
            retryDelay: 1000, // 1 segundo entre reintentos
        },
    },
});
