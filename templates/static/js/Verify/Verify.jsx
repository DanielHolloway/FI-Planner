import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';

import VerifyForm from './VerifyForm';
import Header from '../components/Header';
import PhotoCred from '../components/PhotoCred';

import { authHeader } from '../helpers';

import { userActions, alertActions } from '../actions';


const txtFieldState = {
    valid: true,
    typeMismatch: false,
    errMsg: "" //this is where our error message gets across
};

class Verify extends Component {
    constructor() {
        super();
        this.state = {
            code: {
                ...txtFieldState,
                fieldName: "Verification code",
                required: true,
                requiredTxt: "Code is required",
                formatErrorTxt: "Incorrect code format",
                type: "number",
                pattern: "",
                value: ''
            },
            allFieldsValid: false
        };
        this.submitEntry = this.submitEntry.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.reIssueCode = this.reIssueCode.bind(this);

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

    postCode() {
        console.log("posting this!",this.state);
        if(this.state.allFieldsValid){
            var postHeader = authHeader();
            postHeader['Accept'] = 'application/json';
            postHeader['Content-Type'] = 'application/json';
            fetch('/api/Verify', {
                method: 'POST',
                headers: postHeader,
                body: JSON.stringify({
                    code: this.state.code.value
                })
            })
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                if(data.error){
                    throw Error(data.message);
                }
                console.log("DATA STORED",data);
                //const { username, password } = this.state;
                const user = {
                    first_name: data.first_name,
                    last_name: data.last_name,
                    user_name: data.user_name
                }
                const { dispatch } = this.props;
                console.log(user,this.props);
                if (user.user_name) {
                   dispatch(userActions.verify(user));
                }
                this.state = {
                    code: {
                        ...this.state[code],
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
        this.setState({ ...formValues, allFieldsValid }, this.postCode); //we set the state based on the extracted values from Constraint Validation API
        
    };

    submitEntry(e) {
        e.preventDefault();
        this.validateSubmit(e.target);
    }

    reIssueCode() {
        console.log("reissuing code",this.state);
        var postHeader = authHeader();
        postHeader['Accept'] = 'application/json';
        postHeader['Content-Type'] = 'application/json';
        fetch('/api/Verify', {
            method: 'PUT',
            headers: postHeader
        })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            if(data.error){
                throw Error(data.message);
            }
            console.log("DATA STORED",data);
            
            /*const user = {
                first_name: data.first_name,
                last_name: data.last_name,
                user_name: data.user_name
            }
            const { dispatch } = this.props;
            console.log(user,this.props);
            if (user.user_name) {
                dispatch(userActions.verify(user));
            }
            this.state = {
                code: {
                    ...this.state[code],
                    value: ''
                },
                allFieldsValid: false
            };*/
        })
        .catch((error) => {
            console.log('error: ' + error);
            const { dispatch } = this.props;
            dispatch(alertActions.error("Please wait before sending another verification code"));
            //this.setState({ requestFailed: true });
        });
    }

    render() {
        return (
            <div className="inner h-100">
                <div className="w-100 flex-center-space">
                    <Header />
                    <div className="h-100 w-100 d-flex align-items-center mt-5p">
                        <div className="d-flex flex-row h-100 w-100 flex-even align-items-baseline">
                            <div className="max-85">
                                <VerifyForm 
                                    value={this.state}
                                    handleInputChange={this.handleInputChange}
                                    submitEntry={this.submitEntry}
                                    reIssueCode={this.reIssueCode}
                                    key="verify-form" 
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

const connectedVerify = connect(mapStateToProps)(Verify);
export { connectedVerify as Verify };