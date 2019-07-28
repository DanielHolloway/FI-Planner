import React, { Component } from 'react';

const ErrorValidationLabel = ({ txtLbl }) => (
  <label className="mb-0" htmlFor="" style={{ color: "red" }}>
    {txtLbl}
  </label>
);

const Field = ({
    valid,
    type,
    fieldId,
    fieldName,
    typeMismatch,
    formatErrorTxt,
    requiredTxt,
    value,
    change
}) => {
    const renderErrorLabel = !valid ? (
    <ErrorValidationLabel key={fieldId+"-Err"}
        txtLbl={typeMismatch ? formatErrorTxt : requiredTxt}
    />
    ) : (
    ""
    );
        console.log(valid,
            type,
            fieldId,
            fieldName,
            typeMismatch,
            formatErrorTxt,
            requiredTxt,
            value);
    return (
        <div className="form-group">
            <label htmlFor={fieldName}>{fieldName}</label>
            <input type={type} className="form-control" name={fieldId} placeholder={fieldName} key={fieldId} 
                value={value}
                onChange={change}
                required 
            />
            {renderErrorLabel}
        </div>
    );
};

export default class LoginForm extends Component {
    constructor(props) {
        super(props);
        console.log(props);
    }

    changeData = (event) => {
        event.preventDefault();
        //check validity against HTML required
        const checkValid = event.target.checkValidity();
        this.props.handleInputChange(event);
    }

    submitData = (event) => {
        console.log(event.target);
        this.props.submitEntry(event);
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

    /*buildFields() {
        this.props.value.map((field) => {
            return(
                <div className="form-group">
                    <label htmlFor={field.fieldName}>{field.fieldName}</label>
                    <input type={field.type} className="form-control" name={field.fieldId} 
                        placeholder={field.fieldName} 
                        key={field.fieldId} 
                        value={field.value}
                        onChange={field.change}
                        required 
                    />
                </div>
            )
        });
    }*/

    render() {

        const fields = this.mapFieldInputs();
        console.log(this.props,fields);
        const buildFields = fields.map((field) => {
            return(
                <div className="form-group" key={field.fieldId} >
                    <label htmlFor={field.fieldName}>{field.fieldName}</label>
                    <input type={field.type} className="form-control" name={field.fieldId} 
                        placeholder={field.fieldName} 
                        value={field.value}
                        onChange={this.changeData}
                        required 
                    />
                </div>
            )
        });
        //const renderFields = fields.map(x => <Field {...x} key={x.fieldId} change={this.changeData} />);

        return (
            <form className="table-dark text-white p-3 w-100 glow" onSubmit={this.submitData} noValidate>
                <h3 className="customFont">Sign Up</h3>
                { buildFields }
                {/*<div className="form-group">
                    <label htmlFor="entryName">Name</label>
                    <input type="text" className="form-control" id="entryName" name="name" placeholder="Apples"
                        maxLength={25}
                        value={this.props.value.name.value} 
                        onChange={this.changeData}
                        required
                    />
                    {!this.props.value.name.valid ? (
                      <ErrorValidationLabel
                        txtLbl={this.props.value.name.typeMismatch ? this.props.value.name.formatErrorTxt : this.props.value.name.requiredTxt}
                      />
                    ) : ("")}
                </div>
                <div className="form-group">
                    <label htmlFor="entryMonth">Month</label>
                    <select className="form-control" id="entryMonth" name="month" 
                        value={this.props.value.month.value} 
                        onChange={this.changeData}
                        required
                    >
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="entryCategory">Category</label>
                    <select className="form-control" id="entryCategory" name="category" 
                        value={this.props.value.category.value} 
                        onChange={this.changeData}
                        required
                    >
                        <option>Housing</option>
                        <option>Work</option>
                        <option>Dining</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="entryAmount">Amount</label>
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <span className="input-group-text">$</span>
                        </div>
                        <input type="number" className="form-control" id="entryAmount" name="amount" 
                            aria-label="Amount (to the nearest dollar)" 
                            value={this.props.value.amount.value} 
                            onChange={this.changeData}
                            required
                        />
                        <div className="input-group-append">
                            <span className="input-group-text">.00</span>
                        </div>
                    </div>
                    {!this.props.value.amount.valid ? (
                      <ErrorValidationLabel
                        txtLbl={this.props.value.amount.typeMismatch ? this.props.value.amount.formatErrorTxt : this.props.value.amount.requiredTxt}
                      />
                    ) : ("")}
                </div>*/}
                <button type="submit" className="btn btn-primary">
                    Submit
                </button>
            </form>
        );
    }
}