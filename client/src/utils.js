export const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });

export const validateFileSize = file => file.size / 1024 / 1024 <= 1.5; // 1.5 MB

export const reqgroupTypeLabels = (plural = false) => ({
  "business": plural ? "business considerations" : "business consideration",
  "feature": plural ? "features" : "feature",
  "quality": plural ? "quality attributes" : "quality attribute"
});

export const reviewStatusLabels = {
  draft: {
    color: "var(--secondaryText)",
    label: "Draft",
    minWidth: "3.75rem",
  },
  pending: {
    color: "var(--indigo)",
    label: "Pending",
    minWidth: "5rem",
  },
  accept: {
    color: "var(--green)",
    label: "Accepted",
    minWidth: "6rem",
  },
  requestChanges: {
    color: "var(--red)",
    label: "Changes Requested",
    minWidth: "7rem",
  },
  withdrawn: {
    color: "var(--secondaryText)",
    label: "Withdrawn",
    minWidth: "7rem",
  },
};
