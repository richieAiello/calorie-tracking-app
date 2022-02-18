// Install snackbar in future for notifications
// Notify users when food is added to scroll down and view the food chart

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

// Implementing a chart from chart.js
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

// ***************************************

// Task: Refactor displayFoodCard()
// global array- const storageData = [];
// Everytime API.get(endpoint) with pantryForm- storageData.push(document.name); 
// update the eventListener on foodForm
// everytime a new food item is added after a successful post...
// clearFood()
// API.get(endpoint)- loop through documents and displayFoodCard()
// storageData.push(document.name);
// When all the above is working-
// Completely refactor the currentBtn events to only delete the specfic document in foodStorage
// document location - storageData[foodData.indexOf(foodId)]
// Once document is deleted from firebase-
// splice the index of foodId from storageData and macroData
// then splice from fromData

// ***************************************

// global array for data stored in firebase
const storageData = [];

// global id for events
let eventId = 0;

// global array to work with foodId. Acts as the middleman for storageData and macroData
const foodData = [];

// Renders food items in the pantry
// Adds new button to each food item to individually remove from list and deletes data from firebase.
const displayFoodCard = (name, carbs, protein, fat) => {

    macroData.addFood(carbs, protein, fat);

    eventId++;

    const foodId = eventId;

    foodData.push(foodId);

    list.insertAdjacentHTML(
        'beforeend',
        `<li id="itemId-${eventId}" class="pantry__item">
            <div class="card">
                <h4 class="card__heading">${name}</h4>
                <p class="card__text">${cardCalories(carbs, protein, fat)} calories</p>
                <ul class="card__list flex flex--card">
                    <li class="card__carbs">Carbs<br>${carbs}g</li>
                    <li class="card__protein">Protein<br>${protein}g</li>
                    <li class="card__fat">Fat<br>${fat}g</li>
                </ul>
                <button id="btnId-${eventId}" class="btn btn--remove">Remove</button>
            </div>
        </li>`);
    
    const currentItem = document.querySelector(`#itemId-${eventId}`);
    const currentBtn = document.querySelector(`#btnId-${eventId}`);
    
    // No longer need to run API.get since we have storageData
    currentBtn.addEventListener('click', event => {

        const foodIndex = foodData.indexOf(foodId);

        const document = storageData[foodIndex];

        console.log(document);

        console.log(macroData.food[foodIndex]);


        // API.delete(document)
        //     .then(data => {
        //         console.log("Document deleted");

        //         storageData.splice(foodIndex, 1);
        //         macroData.spliceFood(foodIndex);
        //         foodData.splice(foodIndex, 1);
                
        //         currentItem.remove();
        //         updateChart();
        //         showTotalCalories();
        //     })
        //     // snackbar notification
        //     .catch(error => console.error(error));
    })               
}

// clears foodForm
const clearForm = () => {
    name.value = "";
    carbs.value = "";
    protein.value = "";
    fat.value = "";
}

// clears list, storageData, macroData, and foodData
const clearFood = () => {
    list.innerHTML = "";
    storageData.length = 0;
    macroData.empty();
    foodData.length = 0;
}

// eventListeners

// tests if the endpoint is valid, sets endpoint (if valid) for later use
// empties pantry, injects pantry with fetch data, clears form
pantryForm.addEventListener('submit', event => {
    event.preventDefault();

    API.get(tailor(pantryId.value))
        .then(data => {

            clearFood();

            endpoint = tailor(pantryId.value);

            pantryName.textContent = displayName(endpoint);

            data.documents?.forEach(document => {
               
                storageData.push(document.name);
                
                displayFoodCard(
                    document.fields.name.stringValue,
                    document.fields.carbs.integerValue,
                    document.fields.protein.integerValue,
                    document.fields.fat.integerValue
                );
            });

            pantryId.value = "";
            initChart();
            showTotalCalories();
        })
        // snackbar notification for invalid pantry name
        .catch(error => console.error(error))
});

// uses fetch post to create data in the API with the endpoint variable only if endpoint is truthy
// updates foodChart and displays total calories
foodForm.addEventListener('submit', event => {
    event.preventDefault();

    API.post(endpoint, {
        fields: {
            name: { stringValue: name.value },
            carbs: { integerValue: carbs.value },
            protein: { integerValue: protein.value },
            fat: { integerValue: fat.value }
        }
    })
        .then(data => {
            
            clearForm();

            API.get(endpoint)
                .then(data => {

                    clearFood();

                    data.documents?.forEach(document => {
                        
                        storageData.push(document.name);
                        
                        displayFoodCard(
                            document.fields.name.stringValue,
                            document.fields.carbs.integerValue,
                            document.fields.protein.integerValue,
                            document.fields.fat.integerValue
                        );
                    });

                    updateChart();
                    showTotalCalories();
                })
                // snackbar notification
                .catch(error => console.error(error))
        })
        // snackbar pop-up please enter valid pantry name before adding food
        .catch(error => console.error(error))  
});

// fetch data with get, then loop through data and delete each document individually
// runs clearFood(), then updates the chart and total calories displayed 
// Have button disabled then enable button once a pantry has been accessed?
// or toggle buttons display?
clearBtn.addEventListener('click', event => {
    API.get(endpoint)
        .then(data => {
            // console.log(data.documents)
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