import { useMutation } from '@tanstack/react-query';
import { supabase } from './supabaseClient';
import { compressImage } from './imageCompression';

interface UploadOptions {
    bucket: string;
    folder: string;
}

export const useStorageUpload = ({ bucket, folder }: UploadOptions) => {
    return useMutation({
        mutationFn: async (files: File[]) => {
            const uploadPromises = files.map(async (file) => {
                // Comprimir la imagen antes de subirla
                const { file: compressedFile } = await compressImage(file);
                
                // Generar un nombre único para el archivo
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}${Date.now().toString(36)}.${fileExt}`;
                const filePath = `${folder}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from(bucket)
                    .upload(filePath, compressedFile);

                if (uploadError) {
                    throw uploadError;
                }

                const { data } = supabase.storage
                    .from(bucket)
                    .getPublicUrl(filePath);

                return data.publicUrl;
            });

            return Promise.all(uploadPromises);
        },
    });
};

export const useStorageDelete = ({ bucket }: { bucket: string }) => {
    return useMutation({
        mutationFn: async (paths: string[]) => {
            const { error } = await supabase.storage
                .from(bucket)
                .remove(paths);

            if (error) {
                throw error;
            }
        },
    });
};
