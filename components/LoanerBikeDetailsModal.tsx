
import React, { useState } from 'react';
import { LoanerBike, LoanType } from '../types';
import Modal from './ui/Modal';
import ImageViewer from './ui/ImageViewer';
import { LOANER_STATUS_BADGE_COLORS, LOANER_BIKE_STATUS_TRANSLATIONS } from '../constants';
import { BikePlaceholderIcon, EyeIcon } from './ui/Icons';

interface LoanerBikeDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    bike: LoanerBike;
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-700/50">
        <dt className="text-sm font-medium text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-white sm:mt-0 col-span-2 font-semibold">{value}</dd>
    </div>
);

const LoanerBikeDetailsModal: React.FC<LoanerBikeDetailsModalProps> = ({ isOpen, onClose, bike }) => {
    const [isImageViewerOpen, setImageViewerOpen] = useState(false);
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalles de la Bici de Préstamo" size="lg">
            <div className="space-y-4">
                <div className="w-full h-64 bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center relative group">
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
                        <BikePlaceholderIcon className="w-48 h-48 text-gray-500" />
                    )}
                </div>
                <dl>
                    <DetailRow label="Marca / Modelo" value={`${bike.brand} ${bike.model}`} />
                    <DetailRow label="Nº Referencia" value={<span className="font-mono">{bike.refNumber}</span>} />
                    {bike.serialNumber && <DetailRow label="Nº de Serie" value={<span className="font-mono">{bike.serialNumber}</span>} />}
                    <DetailRow label="Talla" value={bike.size} />
                    <DetailRow label="Estado" value={
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${LOANER_STATUS_BADGE_COLORS[bike.status]}`}>
                            {LOANER_BIKE_STATUS_TRANSLATIONS[bike.status]}
                        </span>
                    } />
                    {bike.entryDate && <DetailRow label="Fecha de Entrada" value={new Date(bike.entryDate).toLocaleDateString('es-ES')} />}
                    
                    {bike.loanDetails && (
                        <>
                            <div className="pt-4 mt-4 border-t border-gray-600">
                                <h3 className="text-lg font-semibold text-sky-400">Detalles del Préstamo/Alquiler</h3>
                            </div>
                            <DetailRow label="Tipo" value={bike.loanDetails.loanType === LoanType.Rental ? 'Alquiler' : 'Préstamo'} />
                            <DetailRow label="Nombre" value={bike.loanDetails.loaneeName} />
                            <DetailRow label="Teléfono" value={bike.loanDetails.loaneePhone} />
                            <DetailRow label="DNI" value={bike.loanDetails.loaneeDni} />
                            <DetailRow label="Fecha Inicio" value={new Date(bike.loanDetails.startDate).toLocaleString('es-ES')} />
                            {bike.loanDetails.loanType === LoanType.Rental && (
                                <DetailRow label="Duración Alquiler" value={bike.loanDetails.rentalDuration} />
                            )}
                             {bike.loanDetails.loanType === LoanType.Loan && (
                                <DetailRow label="Motivo Préstamo" value={bike.loanDetails.loanReason} />
                            )}
                        </>
                    )}

                    <div className="py-2 mt-4">
                        <dt className="text-sm font-medium text-gray-400">Observaciones</dt>
                        <dd className="mt-1 text-sm text-white bg-gray-900/50 p-3 rounded-md">{bike.observations || 'No hay observaciones.'}</dd>
                    </div>
                </dl>
                <div className="flex justify-end pt-6 pb-4">
                    <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        Cerrar
                    </button>
                </div>
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

export default LoanerBikeDetailsModal;