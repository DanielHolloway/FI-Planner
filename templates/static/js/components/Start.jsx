import React, { Component } from 'react';
import { Route, Link, withRouter } from 'react-router-dom'
export default class Start extends Component {

    constructor() {
        super();
        this.state = {
        };
        this.start = this.start.bind(this);
    }

    start(e) {
        e.preventDefault();
        const { history } = this.props;
        if(history) history.push('/journal');
    }

    render() {
        const { history } = this.props;
        
        return (
            <div className="d-flex flex-wrap justify-content-center align-items-center align-content-center">
                <div className="btn-group">
                    <h2>
                        <span onClick={this.start} className="badge badge-pill badge-primary cursor-pointer skyback p-3 font-weight-normal">
                            Get Started
                        </span> 
                    </h2>        
                </div>
            </div>
        );
    }
}