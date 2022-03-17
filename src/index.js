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

const app = document.querySelector('.app');
const heroHeading = document.querySelector('.hero__heading');
const accessSection = document.querySelector('.access');
const accessForm = document.querySelector('.access__form');
const accessBtn = document.querySelector('.btn.btn--access');
const accessId = document.querySelector('#access__name');
const foodSection = document.querySelector('.food');
const foodForm = document.querySelector('.food__form');
const foodBtn = document.querySelector('.btn.btn--food');
const name = document.querySelector('#food__name');
const carbs = document.querySelector('#carbs');
const protein = document.querySelector('#protein');
const fat = document.querySelector('#fat');
const pantryName = document.querySelector('.pantry__heading');
const pantryTop = document.querySelector('.pantry__top');
const list = document.querySelector('.pantry__list');
const clearBtn = document.querySelector('.btn.btn--clear-pantry');
const calories = document.querySelector('.calories__total');

// Implementing a doughnut chart with chart.js
const chart = document.querySelector('.stats__chart');
const context = chart.getContext('2d');
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
                    '#5E4C5A',
                    '#55917F',
                    '#FFE2D1'
                ],
                hoverBackgroundColor: [
                    'rgba(94, 76, 90, 0.75)',
                    'rgba(85, 145, 127, 0.75)',
                    'rgba(255, 226, 209, 0.75)'
                ],
                borderColor : [
                    '#FFE2D1',
                    '#E1F0C4',
                    '#5E4C5A'
                ],
                borderWidth: 3,
                borderAlign: "inner"
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
                }
            },
            cutout: '35%',
            radius: '100%',
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
    
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

    list.insertAdjacentHTML(
        'beforeend',
        `<li id="itemId-${eventId}" class="pantry__item">
            <div class="card">
                <h4 class="card__heading">${displayName(name)}</h4>
                <p class="card__text">${cardCalories(carbs, protein, fat)} calories</p>
                <ul class="card__list">
                    <li class="card__item card__carbs">Carbs<br><i class="fas fa-bread-slice"></i><br>${carbs}g</li>
                    <li class="card__item card__protein">Protein<br><i class="fas fa-drumstick-bite"></i><br>${protein}g</li>
                    <li class="card__item card__fat">Fat<br><i class="fas fa-cheese"></i><br>${fat}g</li>
                </ul>
                <button id="btnId-${eventId}" class="btn btn--delete"><i class="fas fa-trash-alt"></i></button>
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

// Hides and re-animates pantry form. Updates layout and displays food form
const adjustLayout = () => { 
    app.style.overflowY = "initial";
    accessSection.style.gridColumn = "initial";
    accessSection.style.gridArea = "access";
    foodSection.style.display = "initial";
    pantryTop.style.display = "none";
}



// ***********************************************
//               EVENT LISTENERS
// ***********************************************

/*  Brings the user to top of page on page load or refresh.
    If the user refreshes at the bottom of page while chart and pantry are rendered,
    this event prevents user from seeing white space at bottom of page. Ensures the 
    user views the starting animation.  */

window.addEventListener("beforeunload", event => {
    window.scrollTo(0, 0);
})

// If the endpoint is valid- clears all 3 food arrays and sets an endpoint for later use.
// Displays the Pantry Name based on the endpoint.
// Loops through the documents and pushes the document.name(string) to storageData.
// Displays a food card based on the information received from each document.
// Clears the pantry's value. Initializes a new chart and updates total calories.

accessForm.addEventListener('submit', event => {
    event.preventDefault();

    accessBtn.setAttribute("disabled", "disabled");

    API.get(tailor(accessId.value))
        .then(data => {
            heroHeading.style.margin = "0 0.75em";
            heroHeading.style.padding = "0.5em 0";
            
            clearFood();

            endpoint = tailor(accessId.value);

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

            accessId.value = "";
            adjustLayout();
            initChart();
            showTotalCalories();
        })
        .catch(error => {
            console.error(error);
            snackbar.show('Please enter a valid pantry name!');
        })
        .finally(() => {
            pantryTop.style.display = "initial";
            accessBtn.removeAttribute("disabled");
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

    foodBtn.setAttribute("disabled", "disabled");

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
                })
                .catch(error => {
                    console.error(error);
                    snackbar.show('Server communication errror. Could not receive food item. Refresh and try again.');
                });
            
            foodBtn.removeAttribute("disabled");
        })
        .catch(error => {
            console.error(error);
            snackbar.show('Please access a pantry before adding food items!');
            foodBtn.removeAttribute("disabled");
        });  
});

// Fetch data with get, then loop through data and delete each document individually.
// Runs clearFood(), then updates the chart and total calories displayed.

clearBtn.addEventListener('click', event => {
    clearBtn.setAttribute("disabled", "disabled");

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
            clearBtn.removeAttribute("disabled");
        })
        .catch(error => {
            console.error(error);
            snackbar.show('Server communication error. Could not delete pantry. Refresh and try again!');
            clearBtn.removeAttribute("disabled");
        });
});