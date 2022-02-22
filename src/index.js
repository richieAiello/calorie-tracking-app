import FetchWrapper from "./fetch-wrapper.js";
import Chart from 'chart.js/auto';
import MacroData from "./macro-data.js";
import { tailor, displayName, cardCalories } from "./helpers.js";

const API = new FetchWrapper(`https://firestore.googleapis.com/v1/projects/calorie-tracking-app-d89d9/databases/(default)/documents/`);
let endpoint = null;

const snackbar = require('snackbar');
snackbar.duration = 2000;
snackbar.gap = 500;

const macroData = new MacroData();

const pantryForm = document.querySelector('.access__form');
const pantryId = document.querySelector('#access__name');
const foodForm = document.querySelector('.food__form');
const name = document.querySelector('#food__name');
const carbs = document.querySelector('#carbs');
const protein = document.querySelector('#protein');
const fat = document.querySelector('#fat');
const pantryName = document.querySelector('.pantry__heading');
const list = document.querySelector('.pantry__list');
const clearBtn = document.querySelector('.btn.btn--clear-pantry');
const calories = document.querySelector('.calories__total');

// Implementing a doughnut chart with chart.js
const context = document.querySelector('.stats__chart').getContext('2d');
let foodChart = null;

const initChart = () => {
    foodChart?.destroy();
    
    foodChart = new Chart(context, {
        type: 'doughnut',
        data: {
            labels: [
                "Carbs",
                "Protein",
                "Fat"
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
                ],
                hoverBackgroundColor: [
                    'rgba(255, 99, 132, .75)',
                    'rgba(54, 162, 235, .75)',
                    'rgba(255, 206, 86, .75)'
                ],
                borderColor : [
                    '#000',
                    '#000',
                    '#000'
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
                    ticks: {
                        display: false
                    },
                    grid: {
                        display: false
                    },
                    position: 0
                },
            },
            plugins: {
                title: {
                    display: false
                },
                legend: {
                    display: false
                    // labels: {
                    //     font: {
                    //         size: 26,
                    //         weight: 400,
                    //         style: 'italic'
                    //     },
                    //     color: '#000000',
                    // },
                    // position: 'left'
                }
            },
            cutout: '35%',
            radius: '100%',
            animation: {
                animateScale: true,
                animateRotate: true
            },
            // circumference: 180
        }
    });

    // Media query- changes chart circumference
    const chartHalf = window.matchMedia('(max-width: 1240px)');

    const windowDecrease = event => {
        if (event.matches) {
            foodChart.options.circumference = 180;
        } else {
            foodChart.options.circumference = 360;
        }
    }

    chartHalf.addEventListener('change', windowDecrease);

    windowDecrease(chartHalf);

    return foodChart;
}

// updates data in the chart
const updateChart = () => {
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

// global array for data stored in firebase
const storageData = [];

// global id ensuring every event is unique
let eventId = 0;

// global array to work with foodId. Acts as the middleman for storageData and macroData
const foodData = [];

// Pushes the data of current card to macroData.food.
// Increments eventId by 1 and sets a new foodId equal to the current eventId, then pushes foodId to foodData.
// Renders food items in the pantry and adds a new button to each food item, using a unique eventId.
// Button individually removes food item from list and deletes data from firebase.
// After a successful deletion- splice the indexOf(foodId) from storageData and macroData.
// Then splice from foodData. Finally removes the current food item from the list and updates chart/total calories.
const displayFoodCard = (name, carbs, protein, fat) => {

    macroData.addFood(carbs, protein, fat);

    eventId++;

    const foodId = eventId;

    foodData.push(foodId);

    // Change btn--move to appear as "X" rather than say remove. Maybe even transistion to a trash icon?
    // Or maybe just a trash icon?
    list.insertAdjacentHTML(
        'beforeend',
        `<li id="itemId-${eventId}" class="pantry__item">
            <div class="card">
                <h4 class="card__heading">${displayName(name)}</h4>
                <p class="card__text">${cardCalories(carbs, protein, fat)} calories</p>
                <ul class="card__list">
                    <li class="card__item card__carbs">Carbs<br><i class="fas fa-bread-slice card__icon"></i><br>${carbs}g</li>
                    <li class="card__item card__protein">Protein<br><i class="fas fa-drumstick-bite card__icon"></i><br>${protein}g</li>
                    <li class="card__item card__fat">Fat<br><i class="fas fa-cheese card__icon"></i><br>${fat}g</li>
                </ul>
                <button id="btnId-${eventId}" class="btn btn--delete">delete</button>
            </div>
        </li>`);
    
    const currentItem = document.querySelector(`#itemId-${eventId}`);
    const currentBtn = document.querySelector(`#btnId-${eventId}`);
    
    currentBtn.addEventListener('click', event => {

        const foodIndex = foodData.indexOf(foodId);

        const document = storageData[foodIndex];

        API.delete(document)
            .then(data => {

                storageData.splice(foodIndex, 1);
                macroData.spliceFood(foodIndex);
                foodData.splice(foodIndex, 1);
               
                currentItem.remove();
                updateChart();
                showTotalCalories();
                snackbar.show('Scroll down to view your delicious statistics!');
            })
            .catch(error => {
                console.error(error);
                snackbar.show('Server communication error. Could not delete document. Refresh and try again.');
            });
    })               
}

// clears all values of foodForm
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

// If the endpoint is valid- clears all 3 food arrays and sets an endpoint for later use.
// Displays the Pantry Name based on the endpoint.
// Loops through the documents and pushes the document.name(string) to storageData.
// Displays a food card based on the information received from each document.
// Clears the pantry's value. Initializes a new chart and updates total calories.
pantryForm.addEventListener('submit', event => {
    event.preventDefault();

    API.get(tailor(pantryId.value))
        .then(data => {

            clearFood();

            endpoint = tailor(pantryId.value);

            pantryName.textContent = displayName(endpoint);

            snackbar.show(`Successfully accessed pantry: ${displayName(endpoint)}!`);

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
        .catch(error => {
            console.error(error);
            snackbar.show('Please enter a valid pantry name!');
        })
});

// Uses fetch post to create data in firebase only if endpoint is truthy.
// Planning to notify user with a snackbar pop up when endpoint is invalid.
// Fetch gets data from firebase. On a successful get-
// Runs clearFood() to empty list and all arrays.
// Then loops through the documents and pushes document.name(string) to storageData for each document.
// Displays a food card for each document based on the data.
// Updates foodChart and displays total calories.
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

                    data.documents.forEach(document => {
                        
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
                    snackbar.show('Scroll down to view your delicious statistics!');
                })
                .catch(error => {
                    console.error(error);
                    snackbar.show('Server communication errror. Could not receive food item. Refresh and try again.');
                });
        })
        .catch(error => {
            console.error(error);
            snackbar.show('Please access a pantry before adding food items!');
        });  
});

// Fetch data with get, then loop through data and delete each document individually.
// Runs clearFood(), then updates the chart and total calories displayed.

// Have button disabled then enable button once a pantry has been accessed?
clearBtn.addEventListener('click', event => {
    API.get(endpoint)
        .then(data => {
            data.documents.forEach(document => {
                
                API.delete(document.name)
                    .then(data => {
                        console.log("Document deleted");
                    })
                    .catch(error => {
                        console.error(error);
                        snackbar.show('Server communication error. Could not delete document. Refresh and try again.');
                    });
            });
            clearFood();
            updateChart();
            showTotalCalories();
            snackbar.show(`Successfully emptied pantry: ${displayName(endpoint)}!`);
        })
        .catch(error => {
            console.error(error);
            snackbar.show('Server communication error. Could not delete pantry. Refresh and try again!');
        });
});