import React, { useState, useRef, useEffect } from 'react';
import { XIcon, ZoomInIcon, ZoomOutIcon, RotateCcwIcon } from './Icons';

interface ImageViewerProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    altText: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ isOpen, onClose, imageUrl, altText }) => {
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [lastTouchDistance, setLastTouchDistance] = useState(0);
    const [isTouch, setIsTouch] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Reset cuando se abre
    useEffect(() => {
        if (isOpen) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
            setIsDragging(false);
            setIsTouch(false);
        }
    }, [isOpen]);

    // Cerrar con ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // Calcular distancia entre dos puntos táctiles
    const getTouchDistance = (touches: TouchList) => {
        if (touches.length < 2) return 0;
        const touch1 = touches[0];
        const touch2 = touches[1];
        return Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) + 
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
    };

    // Obtener centro entre dos puntos táctiles
    const getTouchCenter = (touches: TouchList) => {
        if (touches.length < 2) return { x: touches[0].clientX, y: touches[0].clientY };
        return {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
        };
    };

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev * 1.5, 5)); // Máximo 5x zoom
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev / 1.5, 0.5)); // Mínimo 0.5x zoom
    };

    const handleReset = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1 && !isTouch) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1 && !isTouch) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        if (!isTouch) {
            setIsDragging(false);
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!isTouch) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setScale(prev => Math.max(0.5, Math.min(5, prev + delta)));
        }
    };

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
        setIsTouch(true);
        e.preventDefault();
        
        if (e.touches.length === 1 && scale > 1) {
            // Pan con un dedo
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y
            });
        } else if (e.touches.length === 2) {
            // Pinch zoom con dos dedos
            setIsDragging(false);
            const distance = getTouchDistance(e.touches);
            setLastTouchDistance(distance);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        e.preventDefault();
        
        if (e.touches.length === 1 && isDragging && scale > 1) {
            // Pan con un dedo
            setPosition({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y
            });
        } else if (e.touches.length === 2 && lastTouchDistance > 0) {
            // Pinch zoom con dos dedos
            const distance = getTouchDistance(e.touches);
            const scaleChange = distance / lastTouchDistance;
            
            setScale(prev => {
                const newScale = prev * scaleChange;
                return Math.max(0.5, Math.min(5, newScale));
            });
            
            setLastTouchDistance(distance);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (e.touches.length < 2) {
            setLastTouchDistance(0);
        }
        if (e.touches.length === 0) {
            setIsDragging(false);
            // Mantener isTouch true por un momento para evitar conflictos
            setTimeout(() => setIsTouch(false), 100);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Contenedor principal */}
            <div className="relative w-full h-full flex flex-col">
                {/* Header con controles */}
                <div className="relative z-10 flex items-center justify-between p-4 bg-black/50">
                    <h3 className="text-white font-semibold truncate mr-4">{altText}</h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            onClick={handleZoomOut}
                            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            title="Alejar"
                        >
                            <ZoomOutIcon className="w-5 h-5" />
                        </button>
                        <span className="text-white text-sm px-2 min-w-[50px] text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={handleZoomIn}
                            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            title="Acercar"
                        >
                            <ZoomInIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleReset}
                            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            title="Resetear"
                        >
                            <RotateCcwIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors ml-2"
                            title="Cerrar"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Contenedor de imagen */}
                <div 
                    ref={containerRef}
                    className="flex-1 overflow-hidden flex items-center justify-center"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onWheel={handleWheel}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ 
                        cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                        touchAction: 'none' // Evita scroll nativo en móvil
                    }}
                >
                    <img
                        ref={imageRef}
                        src={imageUrl}
                        alt={altText}
                        className="max-w-none select-none transition-transform duration-200 ease-out"
                        style={{
                            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                            maxHeight: scale === 1 ? '100%' : 'none',
                            maxWidth: scale === 1 ? '100%' : 'none'
                        }}
                        draggable={false}
                    />
                </div>

                {/* Instrucciones */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-black/70 text-white text-xs px-3 py-2 rounded-lg text-center">
                        <p className="hidden sm:block">🖱️ Rueda del ratón: zoom • 🤏 Arrastra para mover • ESC: cerrar</p>
                        <p className="sm:hidden">🤏 Pellizca para zoom • 👆 Arrastra para mover • Toca ✕ para cerrar</p>
                        <p className="text-xs text-gray-400 mt-1">v2.0 - Zoom táctil mejorado</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageViewer;
