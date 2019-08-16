import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import $ from 'jquery';
import Popper from 'popper.js';

import React from 'react';
import ReactDOM from 'react-dom';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route } from 'react-router-dom';


import { history } from './helpers';
import configureStore from './helpers/configureStore';

import { App } from './App';

// setup fake backend
//import { configureFakeBackend } from './helpers';
//configureFakeBackend();

const store = configureStore({});

render(
    <Provider store={store}>
        <Router history={history}>
            <App />
        </Router>
    </Provider>,
    document.getElementById('content')
);