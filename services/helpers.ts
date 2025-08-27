import { supabase } from './supabaseClient';

export const capitalizeFirstLetter = (s: string): string => {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

import { compressImage } from './imageCompression';

export const uploadImageToSupabase = async (file: File): Promise<string | null> => {
    try {
        // Validar el tamaño del archivo original (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('La imagen es demasiado grande. El tamaño máximo es 10MB.');
        }

        // Comprimir la imagen
        const compressedImage = await compressImage(file);
        
        // Crear un nombre de archivo único usando timestamp y dimensiones
        const fileExt = 'jpg'; // Siempre guardamos como JPG después de la compresión
        const fileName = `${Date.now()}_${compressedImage.width}x${compressedImage.height}.${fileExt}`;
        const filePath = `${fileName}`;

        // Subir el archivo comprimido al bucket
        const { data, error } = await supabase.storage
            .from('bike_images')
            .upload(filePath, compressedImage.file, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'image/jpeg'
            });

        if (error) {
            console.error('Error uploading image:', error.message);
            throw error;
        }

        // Obtener la URL pública del archivo
        const { data: { publicUrl } } = supabase.storage
            .from('bike_images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error in uploadImageToSupabase:', error);
        throw error;
    }
};

export const deleteImageFromSupabase = async (imageUrl: string | null): Promise<boolean> => {
    if (!imageUrl) return true;
    
    try {
        // Extraer el nombre del archivo de la URL
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        // Verificar que la URL es de nuestro bucket de Supabase
        if (!imageUrl.includes('bike_images') || !fileName) {
            console.warn('URL de imagen no válida para eliminar:', imageUrl);
            return false;
        }

        const { error } = await supabase.storage
            .from('bike_images')
            .remove([fileName]);

        if (error) {
            console.error('Error eliminando imagen de Supabase:', error.message);
            return false;
        }

        console.log('Imagen eliminada exitosamente:', fileName);
        return true;
    } catch (error) {
        console.error('Error in deleteImageFromSupabase:', error);
        return false;
    }
};

export const formatCurrency = (valueInCents: number | null | undefined): string => {
    if (valueInCents === null || typeof valueInCents === 'undefined') return 'N/A';
    const valueInEuros = valueInCents / 100;
    
    // Formatea la moneda sin céntimos para mejorar la legibilidad y ahorrar espacio en el móvil.
    return valueInEuros.toLocaleString('es-ES', { 
        style: 'currency', 
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};

export const calculateDaysBetween = (startDate: string | null, endDate: string | null): number | null => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const differenceInTime = end.getTime() - start.getTime();
    // Return 0 if the bike is sold on the same day it's entered
    return Math.max(0, Math.round(differenceInTime / (1000 * 3600 * 24)));
};

export const calculateProfitMargin = (purchasePrice: number, additionalCosts: number, finalSellPrice: number): number | null => {
    const totalCost = purchasePrice + (additionalCosts || 0);
    if (finalSellPrice <= 0) {
        return null; // Avoid division by zero and illogical scenarios
    }
    const profit = finalSellPrice - totalCost;
    return (profit / finalSellPrice) * 100;
};