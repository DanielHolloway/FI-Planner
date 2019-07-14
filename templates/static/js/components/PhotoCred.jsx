import React, { Component } from 'react';
export default class PhotoCred extends Component {
    constructor() {
        super();
        this.state = {
            pages: [
                {page: "home", name: "Dino Reichmuth", link: "https://unsplash.com/@dinoreichmuth?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge"},
                {page: "journal", name: "Clay Banks", link: "https://unsplash.com/@claybanks?utm_medium=referral&amp;utm_campaign=photographer-credit&amp;utm_content=creditBadge"},
            ],
        };
    }

    pickArtist(targetPage) {
        const result = this.state.pages.find(e => e.page === targetPage.page);
        if (result && this.state.pages) {
            return (
                <div className="flex-container" key={'artist-'+result.page}>
                    <div className="text-white f-85"><p>Photo taken by</p></div>
                    <a className="unsplash-high" href={result.link}
                        target="_blank" rel="noopener noreferrer" title={'Download free do whatever you want high-resolution photos from ' + result.name}
                    >
                        <span className="unsplash-mid">
                        <svg xmlns="http://www.w3.org/2000/svg" className="unsplash-low" viewBox="0 0 32 32">
                            <title>unsplash-logo</title>
                            <path d="M10 9V0h12v9H10zm12 5h10v18H0V14h10v9h12v-9z"></path>
                        </svg>
                        </span>
                        <span className="unsplash-mid">{result.name}</span>
                    </a>
                </div>
            );
        }
        else{
            return [];
        }
    }

    render() {
        const condition = this.props;
        return (
            <div>{this.pickArtist(condition)}</div>
        );
    }
}