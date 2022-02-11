export const capitalize = word => word[0].toUpperCase() + word.substring(1).toLowerCase();

export const tailor = word => word.trim().toLowerCase().replaceAll(" ", "-");