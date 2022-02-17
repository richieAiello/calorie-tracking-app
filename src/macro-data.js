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

    spliceFood(index) {
        this.food.splice(index, 1);
    }

    empty() {
        this.food.length = 0;
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

    totalCalories() {
        return (this.totalCarbs() * 4) + (this.totalProtein() * 4) + (this.totalFat() * 9);
    }
}