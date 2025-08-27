import React, { useState, useEffect } from 'react';
import { Bike, SaleType, SaleData, BikeType, BikeStatus } from '../types';
import Modal from './ui/Modal';
import { BIKE_TYPE_OPTIONS } from '../constants';
import { capitalizeFirstLetter, uploadImageToSupabase } from '../services/helpers';
import AutocompleteInput from './ui/AutocompleteInput';
import { BikePlaceholderIcon } from './ui/Icons';

interface SellBikeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirmSale: (saleData: SaleData) => void;
    bike: Bike;
    allBrands: string[];
    allModels: string[];
    nextRefNumber: string;
}

type TradeInBikeData = Omit<Bike, 'id' | 'status' | 'refNumber'>;

const SellBikeModal: React.FC<SellBikeModalProps> = ({ isOpen, onClose, onConfirmSale, bike, allBrands, allModels, nextRefNumber }) => {
    // These form states will hold prices in euros for the inputs.
    const [saleType, setSaleType] = useState<SaleType>(SaleType.Cash);
    const [cashPortion, setCashPortion] = useState<number | undefined>(undefined);
    const [tradeInBike, setTradeInBike] = useState<Partial<TradeInBikeData>>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setSaleType(SaleType.Cash);
        // Set cash portion to undefined to leave the input blank
        setCashPortion(undefined);
        setTradeInBike({
            brand: '', model: '', serialNumber: null, size: '', 
            purchasePrice: undefined, 
            sellPrice: undefined, 
            observations: '', imageUrl: null, 
            additionalCosts: undefined, 
            type: BikeType.Mountain,
        });
        setImagePreview(null);
        setIsUploading(false);
    }, [isOpen, bike]);

    const handleTradeInChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('Price') || name.includes('Costs')) {
            // Keep the form state in euros
            setTradeInBike(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
        } else if (name === 'serialNumber') {
            setTradeInBike(prev => ({ ...prev, [name]: value.toUpperCase() }));
        } else if (['size', 'observations'].includes(name)) {
            setTradeInBike(prev => ({ ...prev, [name]: capitalizeFirstLetter(value) }));
        } else {
            setTradeInBike(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleTradeInAutocompleteChange = (name: 'brand' | 'model', value: string) => {
        setTradeInBike(prev => ({ ...prev, [name]: capitalizeFirstLetter(value) }));
    };
    
    const handleCashPortionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // Keep the form state in euros
        setCashPortion(value === '' ? undefined : parseFloat(value));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file) return;

            setIsUploading(true);
            try {
                // Crear una URL temporal para la vista previa inmediata
                const tempUrl = URL.createObjectURL(file);
                setImagePreview(tempUrl);

                // Subir la imagen a Supabase
                const publicUrl = await uploadImageToSupabase(file);
                if (publicUrl) {
                    setTradeInBike(prev => ({ ...prev, imageUrl: publicUrl }));
                    // Limpiar la URL temporal
                    URL.revokeObjectURL(tempUrl);
                    // Actualizar la vista previa con la URL de Supabase
                    setImagePreview(publicUrl);
                } else {
                    setImagePreview(null);
                    URL.revokeObjectURL(tempUrl);
                }
            } catch (error: any) {
                alert(error.message || 'Error al subir la imagen');
                setImagePreview(null);
                if (e.target) {
                    e.target.value = ''; // Limpiar input
                }
            }
            setIsUploading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Convert euro values from form back to cents for saving
        const finalCashInCents = Math.round((cashPortion || 0) * 100);
        const tradeInValueInCents = Math.round((tradeInBike.purchasePrice || 0) * 100);
        
        const finalSellPriceInCents = saleType === SaleType.TradeIn ? finalCashInCents + tradeInValueInCents : finalCashInCents;

        const saleData: SaleData = {
            bikeId: bike.id,
            saleType,
            finalSellPrice: finalSellPriceInCents,
            tradeInBike: saleType === SaleType.TradeIn ? {
                brand: tradeInBike.brand!,
                model: tradeInBike.model!,
                type: tradeInBike.type!,
                size: tradeInBike.size!,
                purchasePrice: tradeInValueInCents,
                sellPrice: Math.round((tradeInBike.sellPrice || 0) * 100),
                observations: tradeInBike.observations || '',
                serialNumber: tradeInBike.serialNumber || null,
                imageUrl: tradeInBike.imageUrl || null,
                additionalCosts: Math.round((tradeInBike.additionalCosts || 0) * 100),
                status: BikeStatus.Available,
                refNumber: nextRefNumber, // Se asignará el siguiente número de referencia
                entryDate: new Date().toISOString(),
            } : undefined,
        };
        onConfirmSale(saleData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Vender: ${bike.brand} ${bike.model}`} size="lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300">Tipo de Venta</label>
                    <div className="mt-2 flex rounded-md shadow-sm">
                        <button type="button" onClick={() => setSaleType(SaleType.Cash)} className={`flex-1 px-4 py-2 text-sm font-medium text-white border border-gray-600 rounded-l-md focus:outline-none transition-colors ${saleType === SaleType.Cash ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            Solo Dinero
                        </button>
                        <button type="button" onClick={() => setSaleType(SaleType.TradeIn)} className={`flex-1 px-4 py-2 text-sm font-medium text-white border-t border-b border-r border-gray-600 rounded-r-md focus:outline-none transition-colors ${saleType === SaleType.TradeIn ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            Dinero + Bici a cambio
                        </button>
                    </div>
                </div>

                <div>
                    <label htmlFor="cashPortion" className="block text-sm font-medium text-gray-300">{saleType === SaleType.Cash ? 'Precio Final de Venta (€)' : 'Dinero Recibido (€)'}</label>
                    <input type="number" step="0.01" name="cashPortion" id="cashPortion" value={cashPortion === undefined ? '' : cashPortion} onChange={handleCashPortionChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" />
                </div>

                {saleType === SaleType.TradeIn && (
                    <div className="space-y-6 pt-4 border-t border-gray-700">
                        <h3 className="text-lg font-semibold text-white">Detalles de la Bici Entregada</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-300">Imagen</label>
                             <label htmlFor="tradein_image" className={`mt-1 flex justify-center w-full h-48 px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md transition-colors bg-gray-700/20 ${isUploading ? 'cursor-wait' : 'cursor-pointer hover:border-blue-500'}`}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Vista previa" className="object-cover h-full rounded-md" />
                                ) : (
                                    <div className="space-y-2 text-center self-center text-gray-500">
                                        <BikePlaceholderIcon className="mx-auto h-24 w-24" />
                                        <p className="text-sm font-semibold text-gray-400">
                                            {isUploading ? 'Subiendo imagen...' : 'Añadir foto'}
                                        </p>
                                        <p className="text-xs">
                                            {isUploading ? 'Por favor espere...' : 'Arrastra una imagen o haz clic'}
                                        </p>
                                    </div>
                                )}
                            </label>
                            <input type="file" id="tradein_image" accept="image/*" onChange={handleImageChange} className="sr-only" disabled={isUploading} />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Tipo de Bicicleta</label>
                            <select name="type" value={tradeInBike.type || ''} onChange={handleTradeInChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500">
                                {BIKE_TYPE_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-300">Marca</label>
                                <AutocompleteInput value={tradeInBike.brand || ''} onValueChange={(v) => handleTradeInAutocompleteChange('brand', v)} suggestions={allBrands} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300">Modelo</label>
                                <AutocompleteInput value={tradeInBike.model || ''} onValueChange={(v) => handleTradeInAutocompleteChange('model', v)} suggestions={allModels} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-300">Talla</label>
                                <input name="size" value={tradeInBike.size || ''} onChange={handleTradeInChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-300">Nº de Serie</label>
                                <input name="serialNumber" value={String(tradeInBike.serialNumber || '')} onChange={handleTradeInChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label htmlFor="tradeInValue" className="block text-sm font-medium text-gray-300">Compra (€)</label>
                                <input type="number" step="0.01" name="purchasePrice" id="tradeInValue" value={tradeInBike.purchasePrice === undefined ? '' : tradeInBike.purchasePrice} onChange={handleTradeInChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                             <div>
                                 <label htmlFor="sellPriceTradeIn" className="block text-sm font-medium text-gray-300">Venta (€)</label>
                                 <input type="number" step="0.01" name="sellPrice" id="sellPriceTradeIn" value={tradeInBike.sellPrice === undefined ? '' : tradeInBike.sellPrice} onChange={handleTradeInChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label htmlFor="additionalCostsTradeIn" className="block text-sm font-medium text-gray-300">Costes (€)</label>
                                <input type="number" step="0.01" name="additionalCosts" id="additionalCostsTradeIn" value={tradeInBike.additionalCosts === undefined ? '' : tradeInBike.additionalCosts} onChange={handleTradeInChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300">Otros Datos</label>
                            <textarea name="observations" value={tradeInBike.observations || ''} onChange={handleTradeInChange} rows={2} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"></textarea>
                        </div>

                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-6 pb-4 modal-buttons">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors" disabled={isUploading}>Cancelar</button>
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isUploading}>
                        {isUploading ? 'Subiendo imagen...' : 'Confirmar Venta'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SellBikeModal;