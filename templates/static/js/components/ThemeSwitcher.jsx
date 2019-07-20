import React, { Component } from 'react';
export default class ThemeSwitcher extends Component {

    constructor() {
        super();
        this.state = {
            theme: null,
        };
        this.resetTheme = this.resetTheme.bind(this);
        this.chooseTheme = this.chooseTheme.bind(this);
    }

    resetTheme(e) {
        e.preventDefault();
        this.setState({ theme: null });
    }

    chooseTheme(theme, e) {
        e.preventDefault();
        this.setState({ theme });
    }

    render() {
        const { theme } = this.state;
        const themeClass = theme ? theme.toLowerCase() : 'secondary';

        return (
            <div className="d-flex flex-wrap justify-content-center align-items-center align-content-center">
      
                
                <div className="btn-group">
                
                    <button type="button" onClick={this.resetTheme} className={'btn btn-${themeClass} btn-lg'}>{ theme || 'Choose' } Theme</button>
                    
                    <button type="button" className={'btn btn-${themeClass} btn-lg dropdown-toggle dropdown-toggle-split'} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span className="sr-only">Toggle Theme Dropdown</span>
                    </button>
                    
                    <div className="dropdown-menu">
                    
                        <a className="dropdown-item" onClick={(e) => this.chooseTheme('Primary', e)}>Primary Theme</a>
                        <a className="dropdown-item" onClick={(e) => this.chooseTheme('Danger', e)}>Danger Theme</a>
                        <a class="dropdown-item" onClick={(e) => this.chooseTheme('Success', e)}>Success Theme</a>
                        
                        <div className="dropdown-divider"></div>
                        
                        <a className="dropdown-item" onClick={this.resetTheme}>Default Theme</a>
                    </div>
                    
                
                </div>
                
            </div>
        );
    }
}