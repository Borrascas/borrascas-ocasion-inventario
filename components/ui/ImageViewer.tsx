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
    const containerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Reset cuando se abre
    useEffect(() => {
        if (isOpen) {
            setScale(1);
            setPosition({ x: 0, y: 0 });
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

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && scale > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale(prev => Math.max(0.5, Math.min(5, prev + delta)));
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
                    <h3 className="text-white font-semibold truncate">{altText}</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleZoomOut}
                            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                            title="Alejar"
                        >
                            <ZoomOutIcon className="w-5 h-5" />
                        </button>
                        <span className="text-white text-sm px-2">
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
                    style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
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
                    <div className="bg-black/70 text-white text-xs px-3 py-2 rounded-lg">
                        <p>🖱️ Rueda del ratón: zoom • 🤏 Arrastra para mover • ESC: cerrar</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageViewer;
