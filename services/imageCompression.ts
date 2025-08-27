interface CompressedImage {
    file: File;
    width: number;
    height: number;
}

export const compressImage = async (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8): Promise<CompressedImage> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            
            img.onload = () => {
                // Calcular las nuevas dimensiones manteniendo la proporción
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                // Convertir a blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Error al comprimir la imagen'));
                            return;
                        }
                        
                        // Crear un nuevo archivo con el mismo nombre pero comprimido
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        
                        resolve({
                            file: compressedFile,
                            width,
                            height
                        });
                    },
                    'image/jpeg',
                    quality
                );
            };
            
            img.onerror = () => {
                reject(new Error('Error al cargar la imagen'));
            };
        };
        
        reader.onerror = () => {
            reject(new Error('Error al leer el archivo'));
        };
    });
};
