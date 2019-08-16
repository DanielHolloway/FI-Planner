import React, { Component } from 'react';
import Journal from './Journal';

const ErrorValidationLabel = ({ txtLbl }) => (
  <label className="mb-0 error-color" htmlFor="">
    {txtLbl}
  </label>
);

export default class EntryForm extends Component {
    constructor(props) {
        super(props);
    }

    changeData = (event) => {
        event.preventDefault();
        //check validity against HTML required
        const checkValid = event.target.checkValidity();
        this.props.handleInputChange(event);
    }

    submitData = (event) => {
        this.props.submitEntry(event);
    }

    render() {
        return (
            <form className="table-dark text-white p-3 w-100 glow" onSubmit={this.submitData} noValidate>
                <h3 className="customFont">Add another entry</h3>
                <div className="form-group">
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
                </div>
                <button type="submit" className="btn btn-primary">
                    Submit
                </button>
            </form>
        );
    }
}