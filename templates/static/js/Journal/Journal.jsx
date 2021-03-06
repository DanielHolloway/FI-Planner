import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';

import EntryTable from './EntryTable';
import EntryForm from './EntryForm';
import articleData from '../articleData'
import Header from '../components/Header';
import PhotoCred from '../components/PhotoCred';

import { authHeader } from '../helpers';

import { userActions } from '../actions';

const txtFieldState = {
    valid: true,
    typeMismatch: false,
    errMsg: "" //this is where our error message gets across
};

class Journal extends Component {
    constructor() {
        super();
        this.state = {
            shmeats: [],
            name: {
                ...txtFieldState,
                fieldName: "entryName",
                required: true,
                requiredTxt: "Name is required",
                formatErrorTxt: "Incorrect name format",
                type: "text",
                value: ''
            },
            category: {
                ...txtFieldState,
                fieldName: "entryCategory",
                required: true,
                requiredTxt: "Name is required",
                formatErrorTxt: "Incorrect category format",
                type: "text",
                value: 'Work'
            },
            month: {
                ...txtFieldState,
                fieldName: "entryMonth",
                required: true,
                requiredTxt: "Month is required",
                formatErrorTxt: "Incorrect month format",
                type: "text",
                value: 'July'
            },
            amount: {
                ...txtFieldState,
                fieldName: "entryAmount",
                required: true,
                requiredTxt: "Amount is required",
                formatErrorTxt: "Incorrect amount format",
                type: "number",
                value: ''
            },
            allFieldsValid: false
        };
        this.submitEntry = this.submitEntry.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }


    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
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
            const { name, type, value } = x;
    
            return {
              name,
              type,
              typeMismatch, //we use typeMismatch when format is incorrect(e.g. incorrect email)
              value,
              valid: x.checkValidity()
            };
          })
          .reduce((acc, currVal) => {
            //then we finally use reduce, ready to put it in our state
            const { value, valid, typeMismatch, type } = currVal;
            
            const { fieldName, requiredTxt, formatErrorTxt } = this.state[
              currVal.name
            ]; //get the rest of properties inside the state object
    
            //we'll need to map these properties back to state so we use reducer...
            acc[currVal.name] = {
              value,
              valid,
              type,
              typeMismatch,
              fieldName,
              requiredTxt,
              formatErrorTxt
            };
    
            return acc;
          }, {});
          
        return formValues;
    };

    checkAllFieldsValid = formValues => {
      return !Object.keys(formValues)
        .map(x => formValues[x])
        .some(field => !field.valid);
    };

    postEntry() {
        const { user } = this.props;
        
        if(this.state.allFieldsValid){
            var postHeader = authHeader();
            postHeader['Accept'] = 'application/json';
            postHeader['Content-Type'] = 'application/json';
            fetch('/api/Entry', {
                method: 'POST',
                headers: postHeader,
                body: JSON.stringify({
                    name: this.state.name.value,
                    category: this.state.category.value,
                    month: this.state.month.value,
                    amount: this.state.amount.value,
                    related_user_id: user.id
                })
            })
            .then((response) => {
                if(!response.ok) throw new Error(response.status);
                else return response.json();
            })
            .then((data) => {
                this.state = {
                    entryName: '',
                    entryCategory: 'Work',
                    entryMonth: 'May',
                    entryAmount: 0
                };
                this.getEntries();
            })
            .catch((error) => {
            });
        }
    }

    validateSubmit = (target) => {
        //we filter out `allFieldsValid` property as this is not included state for our input fields
        const formValues = this.reduceFormValues(target.elements);
        const allFieldsValid = this.checkAllFieldsValid(formValues);

        this.setState({ ...formValues, allFieldsValid }, this.postEntry); //we set the state based on the extracted values from Constraint Validation API
        
    };

    submitEntry(e) {
        e.preventDefault();
        //hard-coded the related_user_id until I develop user authentication
        this.validateSubmit(e.target);
        
    }

    getEntries() {
        const targetUrl = '/api/Entry/'+this.props.user.id;
        fetch(targetUrl, {
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
    }

    render() {
        {/*const articleSort = this.state.shmeats.sort((a,b)=>(b.comment - a.comment));
        const articleCom = articleSort.map((a)=>(
                <Article key={'article-'+a.key} article={a} />
            )
        )*/}
        return (
            <div className="inner h-100">
                <div className="h-95 w-100 flex-center-space">
                    <Header />
                    <div className="h-100 w-100 d-flex align-items-center mt-5p">
                        <div className="journal-container">
                            <div className="w-25-journal">
                                <EntryForm 
                                    value={this.state}
                                    handleInputChange={this.handleInputChange}
                                    submitEntry={this.submitEntry}
                                    key="entry-form" 
                                />
                            </div>
                            <div className="w-50-journal">
                                {this.state.shmeats}
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
    return {
        user,
        users,
        logFlag
    };
}

const connectedJournal = connect(mapStateToProps)(Journal);
export { connectedJournal as Journal };