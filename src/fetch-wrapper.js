export default class FetchWrapper {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    get(endpoint) {
        return fetch(this.baseURL + endpoint)
            .then(response => response.json());
    }

    post(endpoint, body) {
        return this._send(endpoint, "post", body);
    }

    delete(endpoint) {
        return fetch("https://firestore.googleapis.com/v1/" + endpoint, {
            method: "delete"
        }).then(response => response.json());
    }

    _send(endpoint, method, body) {
        return fetch(this.baseURL + endpoint, {
            method,
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(body)
        }).then(response => response.json());
    }
}