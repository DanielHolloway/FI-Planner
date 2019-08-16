import React, { Component } from 'react';

const ErrorValidationLabel = ({ txtLbl }) => (
  <label className="mb-0 error-color" htmlFor="">
    {txtLbl}
  </label>
);

export default class LoginForm extends Component {
    constructor(props) {
        super(props);
    }

    changeData = (event) => {
        event.preventDefault();
        this.props.handleInputChange(event);
    }

    submitData = (event) => {
        this.props.submitEntry(event);
    }

    reIssueCode = (event) => {
        event.preventDefault();
        this.props.reIssueCode();
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
                    
                    <input type={field.type} className="form-control" name={field.fieldId} 
                        placeholder={field.fieldName} 
                        value={field.value}
                        onChange={this.changeData}
                        {...opts}
                    />
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
                <h3 className="customFont">Please verify your phone</h3>
                { buildFields }
                <div className="d-flex justify-content-between">
                    <button type="submit" className="btn btn-primary">
                        Submit
                    </button>
                    <div type="reissue" onClick={this.reIssueCode} className="btn btn-secondary">
                        Re-issue code
                    </div>
                </div>
            </form>
        );
    }
}