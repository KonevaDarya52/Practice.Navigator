// Уменьшает выбранную картинку до квадрата size×size и возвращает её как data URL.
// Так фото занимает мало места и его можно хранить в браузере до появления backend.
export function resizePhoto(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Не удалось обработать фото"));
        return;
      }
      // Обрезаем по центру до квадрата
      const side = Math.min(image.width, image.height);
      const sx = (image.width - side) / 2;
      const sy = (image.height - side) / 2;
      ctx.drawImage(image, sx, sy, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Файл не похож на картинку"));
    };

    image.src = url;
  });
}
