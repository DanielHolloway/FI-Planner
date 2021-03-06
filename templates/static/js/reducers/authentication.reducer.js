import { userConstants } from '../constants';

let user = {};
try{
    user = JSON.parse(sessionStorage.getItem('user'));
}
catch (e){
    
}

const initialState = user ? { loggedIn: true, user } : {};

export function authentication(state = initialState, action) {
    switch (action.type) {
    case userConstants.VERIFY_REQUEST:
        return {
        loggingIn: true,
        user: action.user
        };
    case userConstants.VERIFY_SUCCESS:
        return {
        loggedIn: true,
        user: action.user
        };
    case userConstants.VERIFY_FAILURE:
        return {};
    case userConstants.LOGIN_REQUEST:
        return {
        loggingIn: true,
        user: action.user
        };
    case userConstants.LOGIN_SUCCESS:
        return {
        loggedIn: true,
        user: action.user
        };
    case userConstants.LOGIN_FAILURE:
        return {};
    case userConstants.REFRESH_REQUEST:
        return {
        loggingIn: true,
        user: action.user
        };
    case userConstants.REFRESH_SUCCESS:
        return {
        loggedIn: true,
        user: action.user
        };
    case userConstants.REFRESH_FAILURE:
        return {};
    case userConstants.LOGOUT:
        return {};
    default:
        return state
    }
}