import React from 'react';
import { Router, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import { history } from '../helpers';
import { alertActions } from '../actions';
import { PrivateRoute } from '../components';
import { Home } from '../Home';
import { Journal } from '../Journal';
import { SignUp } from '../SignUp';
import { Verify } from '../Verify';

class App extends React.Component {
    constructor(props) {
        super(props);

        const { dispatch } = this.props;
        console.log("IN APP.JSX",dispatch,history);
        history.listen((location, action) => {
            // clear alert on location change
            console.log("clearing alerts and location is: ",location);
            dispatch(alertActions.clear());
        });
    }

    render() {
        const { alert } = this.props;
        return (
            <div className="wrapper">
                <div className="slide img-journal">
                    {/* ${alert.type}*/}
                    {alert.message &&
                        <div className="alert alert-backer w-100">{alert.message}</div>
                    }
                    <div className="w-100 d-flex flex-grow-1">
                        <Route exact path="/" component={Home} />
                        <Route path="/signup" component={SignUp} />
                        <Route path="/verify" component={Verify} />
                        <PrivateRoute path="/journal" component={Journal} />
                    </div>
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { alert } = state;
    return {
        alert
    };
}

const connectedApp = connect(mapStateToProps)(App);
export { connectedApp as App };