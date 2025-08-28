import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { LoanerBike, LoanData } from '../types';
import { deleteImageFromSupabase } from './helpers';

const QUERY_KEYS = {
    loanerBikes: 'loanerBikes',
    loanerBike: (id: string) => ['loanerBike', id],
};

interface UseLoanerBikesParams {
    page: number;
    pageSize: number;
}

export const useLoanerBikes = ({ page, pageSize }: UseLoanerBikesParams) => {
    return useQuery({
        queryKey: [QUERY_KEYS.loanerBikes, page, pageSize],
        queryFn: async () => {
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;

            const { data: bikes, error, count } = await supabase
                .from('loaner_bikes')
                .select('*', { count: 'exact' })
                .order('entryDate', { ascending: false })
                .range(from, to);

            if (error) throw error;

            return {
                bikes: bikes || [],
                totalPages: Math.ceil((count || 0) / pageSize),
                hasNextPage: (count || 0) > (page * pageSize)
            };
        },
    });
};

// Nueva query sin paginación (como el inventario)
export const useAllLoanerBikes = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.loanerBikes],
        queryFn: async () => {
            const { data: bikes, error } = await supabase
                .from('loaner_bikes')
                .select('*')
                .order('entryDate', { ascending: false });

            if (error) throw error;

            return bikes || [];
        },
    });
};

export const useLoanerBike = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.loanerBike(id),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('loaner_bikes')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!id,
    });
};

export const useCreateLoanerBike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bike: Omit<LoanerBike, 'id'>) => {
            const { data, error } = await supabase
                .from('loaner_bikes')
                .insert([bike])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.loanerBikes] });
        },
    });
};

export const useUpdateLoanerBike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, bike }: { id: string; bike: Partial<LoanerBike> }) => {
            // Si se está actualizando la imagen, obtener la imagen anterior para eliminarla
            let oldImageUrl: string | null = null;
            if (bike.imageUrl !== undefined) {
                const { data: currentBike } = await supabase
                    .from('loaner_bikes')
                    .select('imageUrl')
                    .eq('id', id)
                    .single();
                oldImageUrl = currentBike?.imageUrl || null;
            }

            const { data, error } = await supabase
                .from('loaner_bikes')
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
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.loanerBikes] });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loanerBike(variables.id) });
        },
    });
};

export const useDeleteLoanerBike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            // Primero obtener los datos de la bicicleta para conseguir la URL de la imagen
            const { data: loanerBike, error: fetchError } = await supabase
                .from('loaner_bikes')
                .select('imageUrl')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            // Eliminar la bicicleta de la base de datos
            const { error: deleteError } = await supabase
                .from('loaner_bikes')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            // Eliminar la imagen del bucket si existe
            if (loanerBike?.imageUrl) {
                await deleteImageFromSupabase(loanerBike.imageUrl);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.loanerBikes] });
        },
    });
};

export const useLoanOrRentBike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: LoanData) => {
            const { error } = await supabase
                .from('loaner_bikes')
                .update({
                    status: data.details.loanType === 'Rental' ? 'Alquilada' : 'Prestada',
                    loanDetails: data.details,
                })
                .eq('id', data.bikeId);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.loanerBikes] });
        },
    });
};

export const useReturnBike = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('loaner_bikes')
                .update({
                    status: 'Available',
                    loanDetails: null,
                })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.loanerBikes] });
        },
    });
};
