import React, { useState, useEffect } from 'react';
import { Bike, BikeType } from '../types';
import Modal from './ui/Modal';
import * as Icons from './ui/Icons';
import { BIKE_TYPE_OPTIONS } from '../constants';
import { capitalizeFirstLetter, uploadImageToSupabase } from '../services/helpers';
import { supabase } from '../services/supabaseClient';

interface BikeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (bike: any) => void;
    bike: Bike | null;
    nextRefNumber?: string;
    allBrands: string[];
    allModels: string[];
}

const BikeFormModal: React.FC<BikeFormModalProps> = ({ isOpen, onClose, onSave, bike, nextRefNumber, allBrands, allModels }) => {
    const [formData, setFormData] = useState<Partial<Bike>>({});
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (bike) {
            setFormData({
                ...bike,
                purchasePrice: bike.purchasePrice / 100,
                sellPrice: bike.sellPrice / 100,
                additionalCosts: (bike.additionalCosts || 0) / 100,
            });
            setImagePreview(bike.imageUrl || null);
        } else {
            setFormData({
                refNumber: nextRefNumber,
                serialNumber: null,
                brand: '',
                model: '',
                type: BikeType.Mountain,
                size: '',
                purchasePrice: undefined,
                additionalCosts: undefined,
                sellPrice: undefined,
                observations: '',
                imageUrl: null,
            });
            setImagePreview(null);
        }
    }, [bike, isOpen, nextRefNumber]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.includes('Price') || name.includes('Costs')) {
            setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
        } else if (name === 'serialNumber') {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
        } else if (['size', 'observations'].includes(name)) {
            setFormData(prev => ({ ...prev, [name]: capitalizeFirstLetter(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file) return;

            setIsUploading(true);
            try {
                const publicUrl = await uploadImageToSupabase(file);
                if (publicUrl) {
                    setImagePreview(publicUrl);
                    setFormData(prev => ({ ...prev, imageUrl: publicUrl }));
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
        const dataToSave = {
            ...formData,
            purchasePrice: Math.round((formData.purchasePrice || 0) * 100),
            sellPrice: Math.round((formData.sellPrice || 0) * 100),
            additionalCosts: Math.round((formData.additionalCosts || 0) * 100),
            status: bike ? bike.status : 'Available',  // Mantener el status si es edición, o poner Available si es nueva
            entryDate: new Date().toISOString(),  // Fecha actual para nuevas bicicletas
        };
        onSave(dataToSave);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={bike ? 'Editar Bicicleta' : 'Añadir Nueva Bicicleta'} size="xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                     <label className="block text-sm font-medium text-gray-300">Imagen</label>
                     <label htmlFor="image-upload" className="mt-1 flex justify-center items-center w-full h-48 px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors bg-gray-700/20">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Vista previa" className="object-cover h-full rounded-md" />
                        ) : isUploading ? (
                            <div className="space-y-2 text-center self-center text-gray-400">
                                <Icons.SpinnerIcon className="mx-auto h-12 w-12 animate-spin" />
                                <p className="text-sm font-semibold">Subiendo imagen...</p>
                            </div>
                        ) : (
                            <div className="space-y-2 text-center self-center text-gray-500">
                                <Icons.BikePlaceholderIcon className="mx-auto h-24 w-24" />
                                <p className="text-sm font-semibold text-gray-400">Añadir foto</p>
                                <p className="text-xs">Arrastra una imagen o haz clic</p>
                            </div>
                        )}
                    </label>
                    <input id="image-upload" name="image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" disabled={isUploading} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="refNumber" className="block text-sm font-medium text-gray-300">Nº Referencia</label>
                        <input type="text" name="refNumber" id="refNumber" value={formData.refNumber || ''} readOnly className="mt-1 block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm text-gray-400 cursor-not-allowed" />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-300">Tipo de Bicicleta</label>
                        <select
                            name="type"
                            id="type"
                            value={formData.type || ''}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"
                        >
                            {BIKE_TYPE_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-300">Marca</label>
                        <input 
                            type="text" 
                            name="brand" 
                            id="brand" 
                            value={formData.brand || ''} 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                    <div>
                        <label htmlFor="model" className="block text-sm font-medium text-gray-300">Modelo</label>
                        <input 
                            type="text" 
                            name="model" 
                            id="model" 
                            value={formData.model || ''} 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-1">
                        <label htmlFor="size" className="block text-sm font-medium text-gray-300">Talla</label>
                        <input type="text" name="size" id="size" value={formData.size || ''} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="col-span-2">
                        <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-300">Nº de Serie</label>
                        <input type="text" name="serialNumber" id="serialNumber" value={String(formData.serialNumber || '')} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-300">Compra (€)</label>
                        <input 
                            type="number" 
                            inputMode="decimal"
                            step="0.01" 
                            name="purchasePrice" 
                            id="purchasePrice" 
                            value={formData.purchasePrice === undefined ? '' : formData.purchasePrice} 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                    <div>
                        <label htmlFor="sellPrice" className="block text-sm font-medium text-gray-300">Venta (€)</label>
                        <input 
                            type="number" 
                            inputMode="decimal"
                            step="0.01" 
                            name="sellPrice" 
                            id="sellPrice" 
                            value={formData.sellPrice === undefined ? '' : formData.sellPrice} 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                    <div>
                        <label htmlFor="additionalCosts" className="block text-sm font-medium text-gray-300">Costes (€)</label>
                        <input 
                            type="number" 
                            inputMode="decimal"
                            step="0.01" 
                            name="additionalCosts" 
                            id="additionalCosts" 
                            value={formData.additionalCosts === undefined ? '' : formData.additionalCosts} 
                            onChange={handleChange} 
                            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="observations" className="block text-sm font-medium text-gray-300">Otros Datos</label>
                    <textarea name="observations" id="observations" value={formData.observations || ''} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"></textarea>
                </div>

                <div className="flex justify-end space-x-3 pt-6 pb-4 modal-buttons">
                    <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors">Cancelar</button>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors" disabled={isUploading}>
                        {isUploading ? 'Guardando...' : 'Guardar Bicicleta'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default BikeFormModal;