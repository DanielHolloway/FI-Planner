import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import $ from 'jquery';
import Popper from 'popper.js';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
//import './index.css';

import Routes from "./Routes";
import configureStore from './store/configureStore';
import { fetchInterceptor } from './utils/fetchInterceptor';

const interceptor = fetchInterceptor();
const store = configureStore();

const jsx = (
    <Provider store={store}>
        <Routes />
    </Provider>
);

ReactDOM.render(jsx, document.getElementById("content"));