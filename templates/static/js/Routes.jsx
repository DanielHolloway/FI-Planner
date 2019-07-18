import React, { Component } from 'react';
import { HashRouter, Route, hashHistory } from 'react-router-dom';
import Home from './components/Home';
import Journal from './components/Journal';
import Login from './components/Login';

// import more components
// The exact param disables the partial matching for a route and makes sure that it only
// returns the route if the path is an EXACT match to the current url.
export default class Routes extends Component {

    render() {
        return (
            <HashRouter history={hashHistory}>
                <div>
                    <Route exact path='/' component={Home} />
                    <Route  path='/journal' component={Journal} />
                    <Route  path='/login' component={Login} />
                </div>
            </HashRouter>
        )
    };

};