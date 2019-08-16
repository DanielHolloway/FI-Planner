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
        this.state = {
            backer: 'img-home'
        };

        const { dispatch } = this.props;
        const loc = history.location.pathname;
        this.state = { backer: history.location.pathname };
        if(loc == '/'){
            this.state = { backer: 'img-home' };
        }
        else{
            this.state = { backer: 'img-journal' };
        }
        history.listen((location, action) => {
            // clear alert on location change
            const loc = location.pathname;
            if(loc == '/'){
                this.setState({ backer: 'img-home' });
            }
            else{
                this.setState({ backer: 'img-journal' });
            }
            dispatch(alertActions.clear());
        });
    }

    render() {
        const { alert } = this.props;
        
        return (
            <div className="wrapper">
                <div className={'slide '+this.state.backer}>
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