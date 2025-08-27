import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { Bike, BikeFormData, BikeStatus } from '../types';
import { deleteImageFromSupabase } from './helpers';

const QUERY_KEYS = {
    bikes: 'bikes',
    bike: (id: string) => ['bike', id],
};

// Obtener todas las bicicletas
export const useBikes = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.bikes],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('bikes')
                .select(`
                    id,
                    refNumber,
                    serialNumber,
                    brand,
                    model,
                    type,
                    size,
                    purchasePrice,
                    additionalCosts,
                    sellPrice,
                    finalSellPrice,
                    soldDate,
                    observations,
                    imageUrl,
                    status,
                    entryDate,
                    tradeInBikeId,
                    tradeInForBikeId
                `)
                .order('entryDate', { ascending: false });

            if (error) {
                console.error('Error fetching bikes:', error);
                throw error;
            }
            return data;
        },
    });
};

// Obtener una bicicleta por ID
export const useBike = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.bike(id),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('bikes')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
};

// Crear una nueva bicicleta
export const useCreateBike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bike: BikeFormData) => {
            // Asegurar que tenga todos los campos requeridos
            const bikeData = {
                ...bike,
                status: BikeStatus.Available, // Campo requerido
                entryDate: new Date().toISOString(),
                additionalCosts: bike.additionalCosts || 0
            };

            const { data, error } = await supabase
                .from('bikes')
                .insert([bikeData])
                .select()
                .single();

            if (error) {
                console.error('Error creating bike:', error);
                throw error;
            }
            
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bikes] });
        },
    });
};

// Actualizar una bicicleta
export const useUpdateBike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, bike }: { id: string; bike: Partial<BikeFormData> }) => {
            // Si se está actualizando la imagen, obtener la imagen anterior para eliminarla
            let oldImageUrl: string | null = null;
            if (bike.imageUrl !== undefined) {
                const { data: currentBike } = await supabase
                    .from('bikes')
                    .select('imageUrl')
                    .eq('id', id)
                    .single();
                oldImageUrl = currentBike?.imageUrl || null;
            }

            const { data, error } = await supabase
                .from('bikes')
                .update(bike)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            // Eliminar la imagen anterior si se cambió por una nueva
            if (oldImageUrl && bike.imageUrl && oldImageUrl !== bike.imageUrl) {
                await deleteImageFromSupabase(oldImageUrl);
            }

            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bikes] });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bike(variables.id) });
        },
    });
};

// Eliminar una bicicleta
export const useDeleteBike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            // Primero obtener los datos de la bicicleta para conseguir la URL de la imagen
            const { data: bike, error: fetchError } = await supabase
                .from('bikes')
                .select('imageUrl')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            // Eliminar la bicicleta de la base de datos
            const { error: deleteError } = await supabase
                .from('bikes')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            // Eliminar la imagen del bucket si existe
            if (bike?.imageUrl) {
                await deleteImageFromSupabase(bike.imageUrl);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bikes] });
        },
    });
};

// Vender una bicicleta
export const useSellBike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            finalSellPrice,
            soldDate,
            tradeInBike,
        }: {
            id: string;
            finalSellPrice: number;
            soldDate: string;
            tradeInBike?: BikeFormData;
        }) => {
            let tradeInBikeId: string | undefined;
            if (tradeInBike) {
                // Ensure all required fields are present for the trade-in bike
                const newTradeInBikeData = {
                    ...tradeInBike,
                    status: BikeStatus.Available, // Trade-in bikes are available by default
                    entryDate: new Date().toISOString(),
                    additionalCosts: tradeInBike.additionalCosts || 0,
                    tradeInForBikeId: parseInt(id), // Establecer la referencia a la bici vendida
                };

                const { data: newBike, error: createError } = await supabase
                    .from('bikes')
                    .insert([newTradeInBikeData])
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating trade-in bike:', createError);
                    throw createError;
                }
                tradeInBikeId = newBike.id;
            }

            const { data, error } = await supabase
                .from('bikes')
                .update({
                    finalSellPrice,
                    soldDate,
                    tradeInBikeId,
                    status: BikeStatus.Sold,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bikes] });
        },
    });
};

// Actualizar imágenes de una bicicleta
export const useUpdateBikeImages = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, images }: { id: string; images: string[] }) => {
            const { data, error } = await supabase
                .from('bikes')
                .update({ images })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.bikes] });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.bike(variables.id) });
        },
    });
};
