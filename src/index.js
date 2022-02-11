// Install snackbar in future for notifications

// BaseURL* https://firestore.googleapis.com/v1/projects/calorie-tracking-app-d89d9/databases/(default)/documents/${endpoint}
import FetchWrapper from "./fetch-wrapper.js";
import { tailor, displayName } from "./helpers.js";

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
        });
});

// uses fetch post to create data in the API with the endpoint variable
// injects pantry with food card representing your chosen meal
// run clearForm() on submit
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
        });    
});