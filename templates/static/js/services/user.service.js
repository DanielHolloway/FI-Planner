
import { authHeader } from '../helpers';

export const userService = {
    login,
    logout,
    getAll
};

function login(username, password) {
    console.log("ooo baby");
    const requestOptions = {
        /*method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })*/
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            password_hash: password,
            related_user_id: 2,
            user_name: username
        })
    };

    return fetch('/api/Login', requestOptions)
        .then(handleResponse)
        .then(user => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            console.log("stringifying this user: ", user);
            localStorage.setItem('user', JSON.stringify(user));

            return user;
        });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };

    return fetch('api/User', requestOptions).then(handleResponse)
    .then(users => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('users', JSON.stringify(users));

        return users;
    });
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        console.log("GOT THIS RESPONSE: ",response,data);
        if (!response.ok) {
            if (response.status === 401) {
                // auto logout if 401 response returned from api
                logout();
                location.reload(true);
            }

            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}