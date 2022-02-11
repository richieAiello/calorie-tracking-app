export default class MacroData {
    constructor() {
        this.food = [];
    }

    addFood(carbs, protein, fat) {
        this.food.push({
            carbs: Number.parseInt(carbs, 10),
            protein: Number.parseInt(protein, 10),
            fat: Number.parseInt(fat, 10)
        });
    }

    totalCarbs() {
        return this.food.reduce((total, current) => {
            return total + current.carbs;
        }, 0);
    }

    totalProtein() {
        return this.food.reduce((total, current) => {
            return total + current.protein;
        }, 0);
    }

    totalFat() {
        return this.food.reduce((total, current) => {
            return total + current.fat;
        }, 0);
    }

    totalCaloies() {
        return (totalCarbs() * 4) + (totalProtein() * 4) + (totalFat() * 9);
    }
}