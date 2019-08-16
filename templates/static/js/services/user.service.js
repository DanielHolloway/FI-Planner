
import { authHeader, authHeaderRefresh } from '../helpers';

export const userService = {
    verify,
    login,
    refresh,
    logout,
    getAll
};

function verify(user) {
    const userUpdate = {
        'login': 'True',
        'message': 'Login successful',
        'first_name': user.first_name,
        'last_name': user.last_name,
        'user_name': user.user_name
    }
    sessionStorage.setItem('user', JSON.stringify(userUpdate));
    return userUpdate;

}

function login(username, password) {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            password_hash: password,
            user_name: username
        })
    };

    return fetch('/api/Login', requestOptions)
        .then(handleResponse)
        .then(user => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            sessionStorage.setItem('user', JSON.stringify(user));

            return user;
        });
}

function refresh() {
    if(!authHeaderRefresh()){
        const error = "REFRESH TOKEN UNAVAILABLE";
        return Promise.reject(error);
    }
    const requestOptions = {
        method: 'POST',
        headers: authHeaderRefresh(),
    };

    return fetch('/api/Token', requestOptions)
        .then(handleResponseNoLogout)
        .then(user => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            sessionStorage.setItem('user', JSON.stringify(user));

            return user;
        });
}

function logout() {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader(),
        body: JSON.stringify({
            user_name: 'username'
        })
    };

    return fetch('/api/Token', requestOptions)
        .then(handleResponseNoLogout)
        .then(user => {
            // store user details and jwt token in local storage to keep user logged in between page refreshes
            sessionStorage.removeItem('user');

            return user;
        });
}

function getAll() {
    const requestOptions = {
        method: 'GET',
        headers: authHeader()
    };
    return fetch('api/User', requestOptions).then(handleResponse)
    .then(users => {
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        sessionStorage.setItem('users', JSON.stringify(users));

        return users;
    });
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
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

function handleResponseNoLogout(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }

        return data;
    });
}