import React, { Component } from 'react';
import Octicon, {ChevronLeft, ChevronRight} from '@primer/octicons-react';
export default class EntryTable extends Component {
    constructor(props) {
        super(props);
        var today = new Date();
        this.state = {
            entries: props.entries,
            shmeats: [],
            filterStr: '',
            mL: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            mS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
            mCur: today.getMonth()

        };
        this.filterBySearch = this.filterBySearch.bind(this);
        this.updateTable = this.updateTable.bind(this);
        this.upMonth = this.upMonth.bind(this);
        this.downMonth = this.downMonth.bind(this);
    }

    filterBySearch(item) {
        var check = item.month.toLowerCase().includes(this.state.mS[this.state.mCur].toLowerCase());
        if (check) {
          return true;
        }
        else{
            return false;
        }
    }

    updateTable() {
        let shmeats = this.state.entries.filter(this.filterBySearch).map((entry) => {
            return(
                <tr key={'entry-'+entry.id}>
                    <th scope="row">{entry.id}</th>
                    <td>{entry.name}</td>
                    <td>{entry.month}</td>
                    <td>{entry.category}</td>
                    <td>${entry.amount}</td>
                </tr>
            )
        });
        this.setState({shmeats: shmeats});
    }

    upMonth() {
        const tempCur = this.state.mCur + 1;
        this.setState({mCur: tempCur}, function() {
            this.updateTable();
        });
    }

    downMonth() {
        const tempCur = this.state.mCur - 1;
        this.setState({mCur: tempCur}, function() {
            this.updateTable();
        });
    }

    componentDidMount() {
        this.updateTable();
    }

    render() {        
        return (
            <div>
                <div className="text-white flex-container-h flex-center cursor-pointer">
                    <div onClick={ (e) => this.downMonth() }>
                        <Octicon icon={ChevronLeft} size='medium'/>   
                    </div>              
                    <span className="f-2 p-3">
                        {this.state.mS[this.state.mCur]}
                    </span>
                    <div onClick={ (e) => this.upMonth() }>
                        <Octicon icon={ChevronRight} size='medium'/>     
                    </div>
                </div>
                <div>
                    <table className="table table-dark w-100 glow">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col">Month</th>
                                <th scope="col">Category</th>
                                <th scope="col">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.shmeats}
                        </tbody>
                    </table>
                </div>
            </div>
            
        );
    }
}