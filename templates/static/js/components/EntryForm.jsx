import React, { Component } from 'react';
import Journal from './Journal';
export default class EntryForm extends Component {
    constructor(props) {
        super(props);
        console.log(props);
    }

    changeData = (event) => {
        this.props.handleInputChange(event);
    }

    submitData = (event) => {
        this.props.submitEntry(event);
    }

    render() {
        return (
            <form className="table-dark text-white p-3 w-100 glow">
                <h3 className="customFont">Add another entry</h3>
                <div className="form-group">
                    <label htmlFor="entryName">Name</label>
                    <input type="text" className="form-control" id="entryName" name="entryName" placeholder="Apples"
                        value={this.props.entryName} 
                        onChange={this.changeData}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="entryMonth">Month</label>
                    <select className="form-control" id="entryMonth" name="entryMonth" 
                        value={this.props.entryMonth} 
                        onChange={this.changeData}
                    >
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="entryCategory">Category</label>
                    <select className="form-control" id="entryCategory" name="entryCategory" 
                        value={this.props.entryCategory} 
                        onChange={this.changeData}
                    >
                        <option>Housing</option>
                        <option>Work</option>
                        <option>Dining</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="entryAmount">Amount</label>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <span className="input-group-text">$</span>
                        </div>
                        <input type="text" className="form-control" id="entryAmount" name="entryAmount" aria-label="Amount (to the nearest dollar)" 
                            value={this.props.entryAmount} 
                            onChange={this.changeData}
                        />
                        <div className="input-group-append">
                            <span className="input-group-text">.00</span>
                        </div>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary" 
                    onClick={this.submitData}
                >
                    Submit
                </button>
            </form>
        );
    }
}