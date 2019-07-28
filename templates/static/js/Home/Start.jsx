import React, { Component } from 'react';
import { Route, Link, withRouter } from 'react-router-dom';

export default class Start extends Component {

    constructor() {
        super();
        this.state = {
        };
        this.start = this.start.bind(this);
    }

    start(e) {
        e.preventDefault();
        const { history, logFlag } = this.props;
        if(history){
            if(logFlag){
                history.push('/journal');
            }
            else{
                history.push('/signup');
            }
        }
    }

    render() {
        const { history, logFlag } = this.props;
        
        return (
            <div className="d-flex flex-wrap justify-content-center align-items-center align-content-center">
                <div className="btn-group">
                    <h2>
                        <span onClick={this.start} className="badge badge-pill badge-primary cursor-pointer skyback p-3 font-weight-normal">
                            { logFlag ? "Get Started" : "Sign up" }
                        </span> 
                    </h2>        
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    const { users, authentication } = state;
    const { user } = authentication;
    var logFlag = state.authentication.loggedIn;
    
    return {
        user,
        users,
        logFlag
    };
}