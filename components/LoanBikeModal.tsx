import React, { useState } from 'react';
import { LoanerBike, LoanType, LoanData, LoanDetails } from '../types';
import Modal from './ui/Modal';

interface LoanBikeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmLoan: (loanData: LoanData) => void;
    bike: LoanerBike;
}

const LoanBikeModal: React.FC<LoanBikeModalProps> = ({ isOpen, onClose, onConfirmLoan, bike }) => {
    const [loanDetails, setLoanDetails] = useState<Partial<LoanDetails>>({ loanType: LoanType.Loan });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLoanDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalDetails: LoanDetails = {
            loaneeName: loanDetails.loaneeName,
            loaneePhone: loanDetails.loaneePhone,
            loaneeDni: loanDetails.loaneeDni,
            loanType: loanDetails.loanType!,
            startDate: new Date().toISOString(),
            rentalDuration: loanDetails.loanType === LoanType.Rental ? loanDetails.rentalDuration : undefined,
            loanReason: loanDetails.loanType === LoanType.Loan ? loanDetails.loanReason : undefined,
        };
        onConfirmLoan({ bikeId: bike.id, details: finalDetails });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Prestar / Alquilar: ${bike.brand} ${bike.model}`} size="md">
            <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-300">Tipo de Operación</label>
                    <div className="mt-2 flex rounded-md shadow-sm">
                        <button type="button" onClick={() => setLoanDetails(p => ({...p, loanType: LoanType.Loan}))} className={`flex-1 px-4 py-2 text-sm font-medium text-white border border-gray-600 rounded-l-md focus:outline-none transition-colors ${loanDetails.loanType === LoanType.Loan ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            Préstamo
                        </button>
                        <button type="button" onClick={() => setLoanDetails(p => ({...p, loanType: LoanType.Rental}))} className={`flex-1 px-4 py-2 text-sm font-medium text-white border-t border-b border-r border-gray-600 rounded-r-md focus:outline-none transition-colors ${loanDetails.loanType === LoanType.Rental ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            Alquiler
                        </button>
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-700">
                     <h3 className="text-lg font-semibold text-white">Datos de la Persona</h3>
                    <div>
                        <label htmlFor="loaneeName" className="block text-sm font-medium text-gray-300">Nombre Completo</label>
                        <input type="text" name="loaneeName" id="loaneeName" onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="loaneePhone" className="block text-sm font-medium text-gray-300">Teléfono</label>
                            <input type="tel" name="loaneePhone" id="loaneePhone" onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                        </div>
                        <div>
                            <label htmlFor="loaneeDni" className="block text-sm font-medium text-gray-300">DNI</label>
                            <input type="text" name="loaneeDni" id="loaneeDni" onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" />
                        </div>
                     </div>
                </div>

                {loanDetails.loanType === LoanType.Rental && (
                     <div className="pt-4 border-t border-gray-700">
                        <label htmlFor="rentalDuration" className="block text-sm font-medium text-gray-300">Tiempo Aproximado del Alquiler</label>
                        <input type="text" name="rentalDuration" id="rentalDuration" onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" placeholder="Ej: 3 días, 1 semana..."/>
                    </div>
                )}

                 {loanDetails.loanType === LoanType.Loan && (
                     <div className="pt-4 border-t border-gray-700">
                        <label htmlFor="loanReason" className="block text-sm font-medium text-gray-300">Motivo del Préstamo</label>
                        <input type="text" name="loanReason" id="loanReason" onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white" placeholder="Ej: Bici del cliente en taller..."/>
                    </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-6 pb-4 modal-buttons">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">Cancelar</button>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">Confirmar</button>
                </div>
            </form>
        </Modal>
    );
};

export default LoanBikeModal;