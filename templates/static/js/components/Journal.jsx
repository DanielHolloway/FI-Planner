import React, { Component } from 'react';
import EntryTable from './EntryTable';
import EntryForm from './EntryForm';
import articleData from '../articleData'
import Header from './Header';
import PhotoCred from './PhotoCred';
export default class Journal extends Component {
    constructor() {
        super();
        this.state = {
            shmeats: [],
            entryName: '',
            entryCategory: 'Work',
            entryMonth: 'May',
            entryAmount: 0
        };
        this.submitEntry = this.submitEntry.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value
        })
    }

    submitEntry(e) {
        e.preventDefault();
        //hard-coded the related_user_id until I develop user authentication
        console.log("posting this!",this.state);
        fetch('http://127.0.0.1:5000/api/Entry', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: this.state.entryName,
                category: this.state.entryCategory,
                month: this.state.entryMonth,
                amount: this.state.entryAmount,
                related_user_id: 1
            })
        })
        .then((response) => {
            if(!response.ok) throw new Error(response.status);
            else return response.json();
        })
        .then((data) => {
            console.log("DATA STORED",data);
            this.state = {
                entryName: '',
                entryCategory: 'Work',
                entryMonth: 'May',
                entryAmount: 0
            };
            this.getEntries();
        })
        .catch((error) => {
            console.log('error: ' + error);
            //this.setState({ requestFailed: true });
        });
    }

    getEntries() {
        fetch('http://127.0.0.1:5000/api/Entry')
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
            <div>
                <div className="bg-journal position-absolute">
                </div>
                <div className="position-relative">
                    <div className="h-100 w-100 flex-container">
                        <div className="h-95 w-100 flex-center-space">
                            <Header logo={articleData.logo}/>
                            <div className="h-100 w-100 d-flex align-items-center mt-5">
                                <div className="d-flex flex-row h-100 w-100 flex-even align-items-baseline">
                                    <div className="w-50">
                                        {this.state.shmeats}
                                    </div>
                                    <div className="w-25">
                                        <EntryForm 
                                            value={this.state}
                                            handleInputChange={this.handleInputChange}
                                            submitEntry={this.submitEntry}
                                            key="entry-form" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-100 p-2 flex-bottom-right">
                            <PhotoCred page={'journal'} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}