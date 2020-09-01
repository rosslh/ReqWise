export const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

export const validateFileSize = file => file.size / 1024 / 1024 <= 1.5; // 1.5 MB

export const normalizeString = str => (str.charAt(0).toUpperCase() + str.slice(1)).replace(/([A-Z])/g, ' $1');
