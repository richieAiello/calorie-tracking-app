export const tailor = word => word.trim().toLowerCase().replaceAll(" ", "-");

export const displayName = word => word.replaceAll("-", " ");