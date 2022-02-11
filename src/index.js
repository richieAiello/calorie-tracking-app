// Ensure form values clear upon sumbit
// Create eventListeners for both forms working with fetch and the REST API

// BaseURL* https://firestore.googleapis.com/v1/projects/calorie-tracking-app-d89d9/databases/(default)/documents/${endpoint}
import FetchWrapper from "./fetch-wrapper.js";
import { capitalize, tailor } from "./helpers.js";

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

const displayFood = (name, carbs, protein, fat) => {
    list.insertAdjacentHTML(
        'beforeend',
        `<li>
            <div class="card">
                <h4 class="card__head">${capitalize(name)}</h4>
                <p class="card__text">${0} calories</p>
                <ul class="card__list flex flex--card">
                    <li class="card__carbs">Carbs<br>${carbs}g</li>
                    <li class="card__protein">Protein<br>${protein}g</li>
                    <li class="card__fat">Fat<br>${fat}g</li>
                </ul>
            </div>
        </li>`);
}
