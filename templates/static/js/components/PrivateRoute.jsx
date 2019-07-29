import React from 'react';
import { Route, Redirect } from 'react-router-dom';

console.log('in PrivateRoute',sessionStorage.getItem('user'));

export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        sessionStorage.getItem('user')
            ? <Component {...props} />
            : <Redirect to={{ pathname: '/', state: { from: props.location } }} />
    )} />  
)


