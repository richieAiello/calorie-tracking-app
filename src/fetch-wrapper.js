export default class FetchWrapper {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    get(endpoint) {
        return fetch(this.baseURL + endpoint)
            .then(response => response.json());
    }

    put(endpoint, body) {
        return this._send(endpoint, "put", body);
    }

    post(endpoint, body) {
        return this._send(endpoint, "post", body);
    }

    patch(endpoint, body) {
        return this._send(endpoint, "patch", body);
    }

    delete(endpoint, document) {
        return fetch(`${this.baseURL}${endpoint}/${document}`, {
            method: "delete",
            headers: {
                "Content-type": "application/json"
            },
            body: null
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