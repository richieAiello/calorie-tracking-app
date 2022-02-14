export const tailor = word => word.trim().toLowerCase().replaceAll(" ", "-");

export const displayName = word => word.replaceAll("-", " ");

export const cardCalories = (carbs, protein, fat) => {
    return (carbs * 4) + (protein * 4) + (fat * 9);
}