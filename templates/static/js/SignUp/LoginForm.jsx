import React, { Component } from 'react';
import ReactPhoneInput from 'react-phone-input-2';

const ErrorValidationLabel = ({ txtLbl }) => (
  <label className="mb-0 error-color" htmlFor="">
    {txtLbl}
  </label>
);

export default class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            phone: '',
        }
        this.handleOnChange.bind(this);
    }

    changeData = (event) => {
        event.preventDefault();
        this.props.handleInputChange(event);
    }

    submitData = (event) => {
        this.props.submitEntry(event);
    }

    handleOnChange = (value) => {
        this.setState({ phone: value });
        event = {
            target: {
                type: 'tel',
                value: value,
                name: 'phonenumber'
            }
        }
        this.props.handleInputChange(event);
    }

    mapFieldInputs = () => {
        //we filter out `allFieldsValid` property as this is not included state for our input fields
        return Object.keys(this.props.value)
            .filter(x => x !== "allFieldsValid")
            .map(field => {
                return {
                fieldId: field,
                ...this.props.value[field]
                };
            });
    };


    render() {
        const fields = this.mapFieldInputs();
        const buildFields = fields.map((field) => {
            var opts = {};
            if (field.required) {
                opts['required'] = 'required';
            }
            if (field.pattern.length>0) {
                opts['pattern'] = field.pattern;
            }
            
            return(
                <div className="form-group" key={field.fieldId} >
                    <label htmlFor={field.fieldName}>{field.fieldName}</label>
                    
                    {field.type != 'tel' ? (
                        <input type={field.type} className="form-control" name={field.fieldId} 
                            placeholder={field.fieldName} 
                            value={field.value}
                            onChange={this.changeData}
                            {...opts}
                        />
                    ) : (
                        <div className="text-dark" type={field.type} 
                            name={field.fieldId} 
                            placeholder={field.fieldName} 
                            value={field.value}
                            {...opts}
                        >
                            <ReactPhoneInput style="width: 100%;" defaultCountry={'us'} enableSearchField='true' value={this.state.phone} onChange={this.handleOnChange}
                                
                            />
                        </div>
                    )
                    
                    }
                    {field.type=="password" && 
                        <label className="mb-0" htmlFor="password-reminder">Do not re-use passwords from other websites.</label>
                    }
                    {!field.valid ? (
                      <ErrorValidationLabel
                        txtLbl={field.typeMismatch ? field.formatErrorTxt : field.requiredTxt}
                      />
                    ) : ("")}
                </div>
            )
        });

        return (
            <form className="table-dark text-white p-3 w-100 glow" onSubmit={this.submitData} noValidate>
                <h3 className="customFont">Sign Up</h3>
                { buildFields }
                <button type="submit" className="btn btn-primary">
                    Submit
                </button>
            </form>
        );
    }
}