import React from 'react';
import { Route, Redirect } from 'react-router-dom';

console.log('in PrivateRoute');

export const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        localStorage.getItem('user') && 
        function(){ try{ JSON.parse(localStorage.getItem('user')); } catch(e){ return false; } console.log(localStorage.getItem('user')); return true; }
            ? <Component {...props} />
            : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    )} />  
)


