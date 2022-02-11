// Implement a function to display food items in the pantry
// Create eventListeners for both forms working with fetch and the REST API

// BaseURL* https://firestore.googleapis.com/v1/projects/calorie-tracking-app-d89d9/databases/(default)/documents/${endpoint}
import FetchWrapper from "./fetch-wrapper";

const API = new FetchWrapper(`https://firestore.googleapis.com/v1/projects/calorie-tracking-app-d89d9/databases/(default)/documents/`);

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

let endpoint;
