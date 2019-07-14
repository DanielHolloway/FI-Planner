import React, { Component } from 'react';
export default class Login extends Component {
    constructor() {
        super();
        this.state = {
            user: '',
            pass: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.checkLogin = this.checkLogin.bind(this);
    }

    handleChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        })
    }

    checkLogin(e) {
        e.preventDefault();
        fetch('http://127.0.0.1:5000/api/Login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password_hash: this.state.pass,
                related_user_id: 0,
                user_name: this.state.user
            })
        })
        .then((response) => {
            if(!response.ok) throw new Error(response.status);
            else return response.json();
        })
        .then((data) => {
            console.log("DATA STORED",data);
            /*this.state = {
                entryName: '',
                entryCategory: 'Work',
                entryMonth: 'May',
                entryAmount: 0
            };
            this.getEntries();*/
        })
        .catch((error) => {
            console.log('error: ' + error);
            //this.setState({ requestFailed: true });
        });
    }

   render() {
      return (
        <div className="w-25 mt-1">
            <form className="text-white d-flex flex-row flex-even align-items-center">
                <div className="form-group">
                    <label htmlFor="inputUsername">Username</label>
                    <input type="username" className="form-control" id="inputUsername" aria-describedby="usernameHelp" 
                        placeholder="Enter username" name="user" value={this.state.user} onChange={this.handleChange} 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="inputPassword">Password</label>
                    <input type="password" className="form-control" id="inputPassword" 
                        placeholder="Password" name="pass" value={this.state.pass} onChange={this.handleChange} 
                    />
                </div>
                <div className="mt-1r">
                    <button type="button" className="btn btn-primary skyback" onClick={ (e) => this.checkLogin(e) } >Submit</button>
                </div>
            </form>
        </div>
      )
   }
}