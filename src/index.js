// Install snackbar in future for notifications
// Notify users when fppd is added to scroll down and view the food chart
// 1g carbs = 4 calories, 1g protein = 4 calories, 1g fat = 9 calories

import FetchWrapper from "./fetch-wrapper.js";
import Chart from 'chart.js/auto';
import MacroData from "./macro-data.js";
import { tailor, displayName, cardCalories } from "./helpers.js";

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
const clearBtn = document.querySelector('.btn.btn--clear');
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
const updateChart = () => {
    foodChart.data.labels = [
        `Carbs: ${macroData.totalCarbs()}`,
        `Protein: ${macroData.totalProtein()}`,
        `Fat: ${macroData.totalFat()}`
    ];
    // Must access datasets[0]
    foodChart.data.datasets[0].data = [
        macroData.totalCarbs(),
        macroData.totalProtein(),
        macroData.totalFat()
    ];
    foodChart.update();
}

// Displays the totalCalories from the pantry
const showTotalCalories = () => {
    calories.textContent = macroData.totalCalories();
}

// global food id for card items
let foodId = 0;

// Renders food items in the pantry
// Adds new button to each food item to individually remove from list and deletes data from firebase.
const displayFood = (name, carbs, protein, fat) => {
    macroData.addFood(carbs, protein, fat);

    // avoids having to loop a NodeList and repeatedly remove/add eventListeners
    foodId++;
    
    list.insertAdjacentHTML(
        'beforeend',
        `<li id="item-${foodId}" class="pantry__item">
            <div class="card">
                <h4 class="card__heading">${name}</h4>
                <p class="card__text">${cardCalories(carbs, protein, fat)} calories</p>
                <ul class="card__list flex flex--card">
                    <li class="card__carbs">Carbs<br>${carbs}g</li>
                    <li class="card__protein">Protein<br>${protein}g</li>
                    <li class="card__fat">Fat<br>${fat}g</li>
                </ul>
                <button id="remove-${foodId}" class="btn btn--remove">Remove</button>
            </div>
        </li>`);
    
    // Adds eventListener to current button
    // On click removes the card from the food list. element.remove()
    // Next step is to implement fetch delete for this specific document
    document.querySelector(`#remove-${foodId}`).addEventListener('click', event => {
        console.log("finally");
    })
}

// clears foodForm
const clearForm = () => {
    name.value = "";
    carbs.value = "";
    protein.value = "";
    fat.value = "";
}

// clears list and macroData
const clearFood = () => {
    macroData.food.length = 0;
    list.innerHTML = "";
}

// eventListeners

// tests if the endpoint is valid, sets endpoint (if valid) for later use
// empties pantry, injects pantry with fetch data, clears form
pantryForm.addEventListener('submit', event => {
    event.preventDefault();

    clearFood();

    API.get(tailor(pantryId.value))
        .then(data => {
            console.log(data);
            console.log(data.documents);
            data.documents?.forEach(document => {
                displayFood(
                    document.fields.name.stringValue,
                    document.fields.carbs.integerValue,
                    document.fields.protein.integerValue,
                    document.fields.fat.integerValue
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

// uses fetch post to create data in the API with the endpoint variable only if endpoint is truthy
// updates foodChart and displays total calories
foodForm.addEventListener('submit', event => {
    event.preventDefault();

    if (endpoint) {
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
                updateChart();
                showTotalCalories();
                clearForm();
            })
            // Replace with a snackbar pop-up 
            .catch(error => console.error(error))  
    } else {
        // Replace with a snackbar pop-up
        console.log("Please enter a valid pantry name!");
    }
});


// fetch data with get, then loop through data and delete each document individually
// empties macroData and list, then updates the chart and total calories displayed 
// Have button disabled then enable button once a pantry has been accessed
// or toggle buttons display?
clearBtn.addEventListener('click', event => {
    API.get(endpoint)
        .then(data => {
            console.log(data.documents)
            data.documents.forEach(document => {
                // console.log(document.name);
                API.delete(document.name)
                    .then(data => {
                        // console.log(data);
                        console.log("Document deleted");
                    })
                    // Replace with a snackbar pop-up
                    .catch(error => console.error(error));
            })
            // Add snackbar for success?
            clearFood();
            updateChart();
            showTotalCalories();
        })
        // Replace with a snackbar pop-up
        .catch(error => console.error(error))
});