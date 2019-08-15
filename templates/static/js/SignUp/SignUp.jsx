import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';

import LoginForm from './LoginForm';
import Header from '../components/Header';
import PhotoCred from '../components/PhotoCred';

import { authHeader } from '../helpers';


import { userActions } from '../actions';


const txtFieldState = {
    valid: true,
    typeMismatch: false,
    errMsg: "" //this is where our error message gets across
};

class SignUp extends Component {
    constructor() {
        super();
        this.state = {
            first_name: {
                ...txtFieldState,
                fieldName: "First name",
                required: true,
                requiredTxt: "First name is required",
                formatErrorTxt: "Incorrect first name format",
                type: "text",
                pattern: "",
                value: ''
            },
            last_name: {
                ...txtFieldState,
                fieldName: "Last name",
                required: true,
                requiredTxt: "Last name is required",
                formatErrorTxt: "Incorrect last name format",
                type: "text",
                pattern: "",
                value: ''
            },
            username: {
                ...txtFieldState,
                fieldName: "Username",
                required: true,
                requiredTxt: "Username is required",
                formatErrorTxt: "Incorrect username format",
                type: "text",
                pattern: "",
                value: ''
            },
            phonenumber: {
                ...txtFieldState,
                fieldName: "Phone number",
                required: true,
                requiredTxt: "Phone number is required",
                formatErrorTxt: "Incorrect telephone format",
                type: "tel",
                pattern: "",
                value: ''
            },
            /* do email later
            email: {
                ...txtFieldState,
                fieldName: "Email",
                required: true,
                requiredTxt: "Email is required",
                formatErrorTxt: "Incorrect email format",
                type: "email",
                value: ''
            },*/
            password: {
                ...txtFieldState,
                fieldName: "Password",
                required: true,
                requiredTxt: "Password must be at least 12 characters and contain one uppercase letter, one lowercase letter, one digit, and one special character.",
                formatErrorTxt: "Incorrect password format",
                type: "password",
                pattern: "",
                value: ''
            },
            allFieldsValid: false
        };
        this.submitEntry = this.submitEntry.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);

        console.log("in SignUp jsx deeper");
        //console.log(curUser);
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        console.log(name,value);
        this.setState({
            [name]: {
                ...this.state[name],
                value: value
            }
        });
    }

    reduceFormValues = formElements => {
        const arrElements = Array.prototype.slice.call(formElements); //we convert elements/inputs into an array found inside form element
    
        //we need to extract specific properties in Constraint Validation API using this code snippet
        const formValues = arrElements
          .filter(elem => elem.name.length > 0)
          .map(x => {
            const { typeMismatch } = x.validity;
            const { name, type, value, pattern } = x;
            console.log("getting validity!",typeMismatch,x.checkValidity(),x.validationMessage);
            var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{12,})");
            var validFlag=true;
            if(type=='password'){
                validFlag = strongRegex.test(value);
                console.log(validFlag);
            }
            else{
                validFlag = x.checkValidity();
            }

            return {
              name,
              type,
              pattern,
              typeMismatch, //we use typeMismatch when format is incorrect(e.g. incorrect email)
              value,
              valid: validFlag //x.checkValidity()
            };
          })
          .reduce((acc, currVal) => {
            //then we finally use reduce, ready to put it in our state
            const { value, valid, typeMismatch, type, pattern } = currVal;
            console.log(currVal,this.state[currVal.name]);
            const { fieldName, requiredTxt, formatErrorTxt } = this.state[
              currVal.name
            ]; //get the rest of properties inside the state object
    
            //we'll need to map these properties back to state so we use reducer...
            acc[currVal.name] = {
              value,
              valid,
              type,
              pattern,
              typeMismatch,
              fieldName,
              requiredTxt,
              formatErrorTxt
            };
    
            return acc;
          }, {});
          console.log(formValues);
        return formValues;
    };

    checkAllFieldsValid = formValues => {
      return !Object.keys(formValues)
        .map(x => formValues[x])
        .some(field => !field.valid);
    };

    postUser() {
        console.log("posting this!",this.state);
        if(this.state.allFieldsValid){
            var postHeader = authHeader();
            postHeader['Accept'] = 'application/json';
            postHeader['Content-Type'] = 'application/json';
            fetch('/api/User', {
                method: 'POST',
                headers: postHeader,
                body: JSON.stringify({
                    first_name: this.state.first_name.value,
                    last_name: this.state.last_name.value,
                    user_name: this.state.username.value,
                    phone: this.state.phonenumber.value,
                    password_hash: this.state.password.value
                })
            })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if(data.error){
                    throw Error(data.message);
                }
                console.log("DATA STORED",data,this.props);
                const { history } = this.props;
                history.push('/verify');
                // const { username, password } = this.state;
                // const { dispatch } = this.props;
                // console.log(username,password,this.props);
                // if (username.value && password.value) {
                //    dispatch(userActions.login(username.value, password.value));
                // }
                this.state = {
                    first_name: {
                        ...this.state[first_name],
                        value: ''
                    },
                    last_name: {
                        ...this.state[last_name],
                        value: ''
                    },
                    username: {
                        ...this.state[username],
                        value: ''
                    },
                    phonenumber: {
                        ...this.state[phonenumber],
                        value: ''
                    },
                    password: {
                        ...this.state[password],
                        value: ''
                    },
                    allFieldsValid: false
                };
            })
            .catch((error) => {
                console.log('error: ' + error);
                //this.setState({ requestFailed: true });
            });
        }
    }

    validateSubmit = (target) => {
        //we filter out `allFieldsValid` property as this is not included state for our input fields
        console.log(target);
        const formValues = this.reduceFormValues(target.elements);
        const allFieldsValid = this.checkAllFieldsValid(formValues);
        
        console.log(allFieldsValid);
        this.setState({ ...formValues, allFieldsValid }, this.postUser); //we set the state based on the extracted values from Constraint Validation API
        
    };

    submitEntry(e) {
        e.preventDefault();
        //hard-coded the related_user_id until I develop user authentication
        this.validateSubmit(e.target);
    }

    /*getEntries() {
        fetch('/api/Entry', {
            method: 'GET',
            headers: authHeader()
        })
        .then(results => {
            return results.json();
        }).then(data => {
            let shmeats = this.buildTable(data.data);
            this.setState({shmeats: shmeats});
        });
    }

    buildTable(input) {
        return (
            <EntryTable entries={input} key={'entries-'+input.length} />
        )
    }

    componentDidMount() {
        this.getEntries();
    }*/

    render() {
        return (
            <div className="inner h-100">
                <div className="h-95 w-100 flex-center-space">
                    <Header />
                    <div className="h-100 w-100 d-flex align-items-center mt-5p">
                        <div className="d-flex flex-row h-100 w-100 flex-even align-items-baseline">
                            <div className="max-85">
                                <LoginForm 
                                    value={this.state}
                                    handleInputChange={this.handleInputChange}
                                    submitEntry={this.submitEntry}
                                    key="login-form" 
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="w-100 p-2 flex-bottom-right">
                    <PhotoCred page={'journal'} />
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const { users, authentication } = state;
    const { user } = authentication;
    var logFlag = state.authentication.loggedIn;
    console.log("SKRRT, SKRRT",user,logFlag,state.authentication.loggedIn,state);
    return {
        user,
        users,
        logFlag
    };
}

const connectedSignUp = connect(mapStateToProps)(SignUp);
export { connectedSignUp as SignUp };