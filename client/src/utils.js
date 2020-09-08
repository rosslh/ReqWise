export const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

export const validateFileSize = file => file.size / 1024 / 1024 <= 1.5; // 1.5 MB

export const reqgroupTypeLabels = {
  "business": "business requirement group",
  "feature": "feature",
  "quality": "quality attribute"
};
