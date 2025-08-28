import React, { useMemo, useState } from 'react';
import { Bike, BikeStatus } from '../types';
import Modal from './ui/Modal';
import ImageViewer from './ui/ImageViewer';
import { STATUS_BADGE_COLORS, BIKE_STATUS_TRANSLATIONS, BIKE_TYPE_TRANSLATIONS } from '../constants';
import { formatCurrency, calculateDaysBetween, calculateProfitMargin } from '../services/helpers';
import { BikePlaceholderIcon, EyeIcon } from './ui/Icons';

// --- Reusable Components for the Modal ---

const InfoCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
    <div className={`bg-gray-900/50 rounded-lg overflow-hidden shadow-lg ${className}`}>
        <h3 className="px-4 py-3 text-md font-semibold text-white bg-white/5 border-b border-gray-700/50">{title}</h3>
        <div className="p-4 space-y-3">
            {children}
        </div>
    </div>
);

const DetailItem: React.FC<{ label: string; value: React.ReactNode; valueClassName?: string }> = ({ label, value, valueClassName }) => (
    <div className="flex justify-between items-center text-sm">
        <p className="text-gray-400">{label}</p>
        <p className={`font-semibold text-white text-right ${valueClassName}`}>{value || 'N/A'}</p>
    </div>
);

interface BikeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    bike: Bike;
    bikes: Bike[];
}

const BikeDetailsModal: React.FC<BikeDetailsModalProps> = ({ isOpen, onClose, bike, bikes }) => {
    const [isImageViewerOpen, setImageViewerOpen] = useState(false);

    const tradeInBike = useMemo(() => {
        if (!bike.tradeInBikeId) return null;
        return bikes.find(b => b.id === bike.tradeInBikeId);
    }, [bike, bikes]);

    const tradeInForBike = useMemo(() => {
        if (!bike.tradeInForBikeId) return null;
        return bikes.find(b => b.id === bike.tradeInForBikeId);
    }, [bike, bikes]);

    const financialData = useMemo(() => {
        const totalCost = bike.purchasePrice + (bike.additionalCosts || 0);
        let profit: number | null = null;
        let profitMargin: number | null = null;

        if (bike.status === BikeStatus.Sold && bike.finalSellPrice !== null) {
            profit = bike.finalSellPrice - totalCost;
            profitMargin = calculateProfitMargin(bike.purchasePrice, bike.additionalCosts, bike.finalSellPrice);
        }
        
        return { totalCost, profit, profitMargin };
    }, [bike]);

    const daysInStock = useMemo(() => {
        if (bike.status !== BikeStatus.Sold) return null;
        return calculateDaysBetween(bike.entryDate, bike.soldDate);
    }, [bike]);

    const modalTitle = (
         <div className="flex items-center gap-3">
            <span>{bike.brand} {bike.model}</span>
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${STATUS_BADGE_COLORS[bike.status]}`}>
                {BIKE_STATUS_TRANSLATIONS[bike.status]}
            </span>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} size="xl">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6">
                {/* --- LEFT COLUMN (STORY) --- */}
                <div className="md:col-span-3 space-y-4 sm:space-y-6">
                    <div className="w-full h-48 sm:h-64 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center relative group">
                        {bike.imageUrl ? (
                            <>
                                <img 
                                    src={bike.imageUrl} 
                                    alt={`${bike.brand} ${bike.model}`} 
                                    className="w-full h-full object-cover cursor-pointer" 
                                    onClick={() => setImageViewerOpen(true)}
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                                     onClick={() => setImageViewerOpen(true)}>
                                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                                        <EyeIcon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <BikePlaceholderIcon className="w-32 sm:w-48 h-32 sm:h-48 text-gray-500" />
                        )}
                    </div>                    <InfoCard title="Detalles de la Bicicleta">
                        <DetailItem label="Nº Referencia" value={<span className="font-mono">{bike.refNumber}</span>} />
                        {bike.serialNumber && <DetailItem label="Nº de Serie" value={<span className="font-mono">{bike.serialNumber}</span>} />}
                        <DetailItem label="Tipo" value={BIKE_TYPE_TRANSLATIONS[bike.type]} />
                        <DetailItem label="Talla" value={bike.size} />
                        {bike.entryDate && <DetailItem label="Fecha de Entrada" value={new Date(bike.entryDate).toLocaleDateString('es-ES')} />}
                    </InfoCard>

                    {bike.status === BikeStatus.Sold && (
                        <InfoCard title="Métricas de Venta">
                            {bike.soldDate && <DetailItem label="Fecha de Venta" value={new Date(bike.soldDate).toLocaleDateString('es-ES')} />}
                            {daysInStock !== null && <DetailItem label="Días en Stock" value={`${daysInStock} días`} />}
                        </InfoCard>
                    )}

                    {tradeInBike && bike.status === BikeStatus.Sold && (
                        <InfoCard title="Bicicleta Recibida como Pago">
                            <DetailItem label="Ref. Bici Recibida" value={`#${tradeInBike.refNumber}`} />
                            <DetailItem label="Modelo" value={`${tradeInBike.brand} ${tradeInBike.model}`} />
                            <DetailItem label="Valor Tasado" value={formatCurrency(tradeInBike.purchasePrice)} />
                        </InfoCard>
                    )}

                    {tradeInForBike && (
                         <InfoCard title="Entregada a Cambio de">
                             <DetailItem label="Ref. Bici" value={`#${tradeInForBike.refNumber}`} />
                             <DetailItem label="Modelo" value={`${tradeInForBike.brand} ${tradeInForBike.model}`} />
                        </InfoCard>
                    )}

                    {bike.observations && (
                        <InfoCard title="Observaciones">
                           <p className="text-sm text-gray-300 whitespace-pre-wrap">{bike.observations}</p>
                       </InfoCard>
                    )}
                </div>


                {/* --- RIGHT COLUMN (FINANCIALS) --- */}
                <div className="md:col-span-2 space-y-6">
                    <InfoCard title="Desglose Económico">
                        <DetailItem label="Precio de Compra" value={formatCurrency(bike.purchasePrice)} />
                        {bike.additionalCosts > 0 && <DetailItem label="Costes Adicionales" value={formatCurrency(bike.additionalCosts)} />}
                        <hr className="border-gray-700 my-2" />
                        <DetailItem label="Coste Total" value={formatCurrency(financialData.totalCost)} valueClassName="text-lg text-amber-400" />
                        <hr className="border-gray-700 my-2" />
                        <DetailItem label="Precio de Venta (PVP)" value={formatCurrency(bike.sellPrice)} valueClassName="text-lg text-blue-400" />

                        {bike.status === BikeStatus.Sold && (
                             <DetailItem 
                                label="Venta Final"
                                value={formatCurrency(bike.finalSellPrice)}
                                valueClassName="text-lg text-green-400"
                            />
                        )}

                        {bike.status === BikeStatus.Sold && financialData.profit !== null && (
                            <>
                                <hr className="border-gray-700 my-2" />
                                <div className="grid grid-cols-2 gap-4 pt-2 text-center">
                                    <div>
                                        <p className="text-sm text-gray-400">Beneficio</p>
                                        <p className={`text-2xl font-bold ${financialData.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {formatCurrency(financialData.profit)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Margen</p>
                                        <p className="text-2xl font-bold text-purple-400">
                                            {financialData.profitMargin?.toFixed(2) ?? 'N/A'}%
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </InfoCard>
                    
                    {tradeInBike && typeof bike.finalSellPrice === 'number' && (
                         <InfoCard title="Detalle del Pago">
                             <DetailItem label="Importe Pagado" value={formatCurrency(bike.finalSellPrice - tradeInBike.purchasePrice)} />
                             <DetailItem label="Valor Bici Entregada" value={formatCurrency(tradeInBike.purchasePrice)} />
                             <p className="text-xs text-gray-400 pt-2 text-right">
                                Ref. #{tradeInBike.refNumber} - {tradeInBike.brand} {tradeInBike.model}
                            </p>
                        </InfoCard>
                    )}
                </div>
            </div>
             <div className="flex justify-end pt-8">
                <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                    Cerrar
                </button>
            </div>
            
            {/* ImageViewer Modal */}
            {bike.imageUrl && (
                <ImageViewer
                    isOpen={isImageViewerOpen}
                    onClose={() => setImageViewerOpen(false)}
                    imageUrl={bike.imageUrl}
                    altText={`${bike.brand} ${bike.model} - Ref. ${bike.refNumber}`}
                />
            )}
        </Modal>
    );
};

export default BikeDetailsModal;