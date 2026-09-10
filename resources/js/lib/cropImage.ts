interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
    });


// Recorta la parte seleccionada de la fotografía
export async function getCroppedImage(
    imageSrc: string,
    crop: PixelCrop
): Promise<Blob> {

    const image = await createImage(imageSrc);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('No se pudo crear el recorte');
    }

    canvas.width = crop.width;
    canvas.height = crop.height;

    context.drawImage(
        image,
        crop.x,
        crop.y,
        crop.width,
        crop.height,
        0,
        0,
        crop.width,
        crop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(
                        new Error(
                            'No se pudo generar la fotografía'
                        )
                    );
                }
            },
            'image/jpeg',
            0.9
        );
    });
}