import { userConstants } from '../constants';
import { userService } from '../services';
import { alertActions } from './';
import { history } from '../helpers';

export const userActions = {
    verify,
    login,
    refresh,
    logout,
    getAll
};

function verify(user) {
    return dispatch => {
        dispatch(request({ user }));

        userService.verify(user);
        dispatch(success(user));
        history.push('/');
            /*.then(
                user => { 
                    dispatch(success(user));
                    history.push('/');
                },
                error => {
                    dispatch(failure(error));
                    dispatch(alertActions.error(error));
                }
            );*/
    };

    function request(user) { return { type: userConstants.VERIFY_REQUEST, user } }
    function success(user) { return { type: userConstants.VERIFY_SUCCESS, user } }
    function failure(error) { return { type: userConstants.VERIFY_FAILURE, error } }
}

function login(username, password) {
    return dispatch => {
        dispatch(request({ username }));

        userService.login(username, password)
            .then(
                user => { 
                    dispatch(success(user));
                    history.push('/');
                },
                error => {
                    dispatch(failure(error));
                    dispatch(alertActions.error(error));
                }
            );
    };

    function request(user) { return { type: userConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: userConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: userConstants.LOGIN_FAILURE, error } }
}

function refresh() {
    return dispatch => {
        dispatch(request());

        
        //userService.getAll()
        //    .then(function(users) {
                    userService.refresh()
                        .then(
                            user => { 
                                /*if(user.success == false){
                                    dispatch(failure(user));
                                }
                                console.log(users,user);
                                var result = users.data.filter(obj => {
                                    return obj.user_name === user.user_name
                                });
                                user.first_name = result[0].first_name;
                                user.last_name = result[0].last_name;
                                user.id = result[0].id;
                                console.log(result[0],user);*/
                                dispatch(success(user));
                                history.push('/');
                            },
                            error => {
                                dispatch(failure(error));
                                //dispatch(alertActions.error(error));
                            }
                        );
        //    });
    };

    function request() { return { type: userConstants.REFRESH_REQUEST } }
    function success(user) { return { type: userConstants.REFRESH_SUCCESS, user } }
    function failure(error) { return { type: userConstants.REFRESH_FAILURE, error } }
}

function logout(username) {
    return dispatch => {
        userService.logout()
                .then(
                    user => dispatch(request(user)),
                    error => { 
                        dispatch(request(error));
                        //dispatch(alertActions.error(error))
                });
    };

    function request() { return { type: userConstants.LOGOUT } }
}

function getAll() {
    return dispatch => {
        dispatch(request());

        userService.getAll()
            .then(
                users => dispatch(success(users)),
                error => { 
                    dispatch(failure(error));
                    dispatch(alertActions.error(error))
                }
            );
    };

    function request() { return { type: userConstants.GETALL_REQUEST } }
    function success(users) { return { type: userConstants.GETALL_SUCCESS, users } }
    function failure(error) { return { type: userConstants.GETALL_FAILURE, error } }
}