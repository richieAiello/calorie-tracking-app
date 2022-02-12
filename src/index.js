// Install snackbar in future for notifications
// 1g carbs = 4 calories, 1g protein = 4 calories, 1g fat = 9 calories
// Create a function to recalculate macros and update chart

// BaseURL* https://firestore.googleapis.com/v1/projects/calorie-tracking-app-d89d9/databases/(default)/documents/${endpoint}
import FetchWrapper from "./fetch-wrapper.js";
import Chart from 'chart.js/auto';
import MacroData from "./macro-data.js";
import { tailor, displayName } from "./helpers.js";

const API = new FetchWrapper(`https://firestore.googleapis.com/v1/projects/calorie-tracking-app-d89d9/databases/(default)/documents/`);
let endpoint = null;

const macroData = new MacroData();

const pantryForm = document.querySelector('.access-pantry');
const pantryId = document.querySelector('#access-pantry__name');
const foodForm = document.querySelector('.food__form');
const name = document.querySelector('#food__name');
const carbs = document.querySelector('#carbs');
const protein = document.querySelector('#protein');
const fat = document.querySelector('#fat');
const pantryName = document.querySelector('.pantry__heading');
const list = document.querySelector('.pantry__list');

const calories = document.querySelector('.calories__total');
const context = document.querySelector('.stats__chart').getContext('2d');
let foodChart = null;

// Implementing a chart
// Learn how to make bigger labels
const initChart = () => {
    foodChart?.destroy();
    
    foodChart = new Chart(context, {
        type: 'bar',
        data: {
            labels: [
                `Carbs: ${macroData.totalCarbs()}`,
                `Protein: ${macroData.totalProtein()}`,
                `Fat: ${macroData.totalFat()}`
            ],
            datasets: [{
                label: 'Macro Nutrients',
                data: [
                    macroData.totalCarbs(),
                    macroData.totalProtein(),
                    macroData.totalFat()
                ],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 206, 86)'
                ]
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false
                    },
                    position: 0
                },
                x: {
                    grid: {
                        display: false
                    },
                    position: "top"
                },
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: false
                }
            }
        }
    });
    return foodChart;
}

// updates chart
// still broken
const updateChart = () => {
    // This part works
    foodChart.data.labels = [
        `Carbs: ${macroData.totalCarbs()}`,
        `Protein: ${macroData.totalProtein()}`,
        `Fat: ${macroData.totalFat()}`
    ];
    // Find a way to recalculate these values in the charts dataset
    foodChart.data.datasets.data = [
        macroData.totalCarbs(),
        macroData.totalProtein(),
        macroData.totalFat()
    ];
    // foodChart.update();
}

// Displays the totalCalories from the pantry
const showTotalCalories = () => {
    calories.textContent = macroData.totalCalories();
}

// Renders food items in the pantry
const displayFood = (name, carbs, protein, fat) => {
    macroData.addFood(carbs, protein, fat);
    list.insertAdjacentHTML(
        'beforeend',
        `<li>
            <div class="card">
                <h4 class="card__heading">${name}</h4>
                <p class="card__text">${0} calories</p>
                <ul class="card__list flex flex--card">
                    <li class="card__carbs">Carbs<br>${carbs}g</li>
                    <li class="card__protein">Protein<br>${protein}g</li>
                    <li class="card__fat">Fat<br>${fat}g</li>
                </ul>
            </div>
        </li>`);
}

const clearForm = () => {
    name.value = "";
    carbs.value = "";
    protein.value = "";
    fat.value = "";
} 

// eventListeners

// tests if the endpoint is valid, sets endpoint (if valid) for later use
// empties pantry, injects pantry with fetch data, clears form
pantryForm.addEventListener('submit', event => {
    event.preventDefault();

    macroData.food.length = 0;
    list.innerHTML = "";
    pantryName.textContent = "";
    
    API.get(tailor(pantryId.value))
        .then(data => {
            console.log(data.documents);
            data.documents?.forEach(doc => {
                displayFood(
                    doc.fields.name.stringValue,
                    doc.fields.carbs.integerValue,
                    doc.fields.protein.integerValue,
                    doc.fields.fat.integerValue
                );
            });
            endpoint = tailor(pantryId.value);
            pantryName.textContent = displayName(endpoint);
        })
        .catch(error => console.error(error))
        .finally(() => {
            pantryId.value = "";
            initChart();
            showTotalCalories();
        });
});

// uses fetch post to create data in the API with the endpoint variable
// updates foodChart
foodForm.addEventListener('submit', event => {
    event.preventDefault();

    API.post(endpoint, {
        fields :{
            name: { stringValue: name.value },
            carbs: { integerValue: carbs.value },
            protein: { integerValue: protein.value },
            fat: { integerValue: fat.value }
        }
    })
        .then(data => {
            console.log(data);
            displayFood(
                name.value,
                carbs.value,
                protein.value,
                fat.value
            );
        })
        .catch(error => console.error(error))
        .finally(() => {
            clearForm();
            // Implement a way to update foodChart
            // updateChart();
            showTotalCalories();
        });    
});