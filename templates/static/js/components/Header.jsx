import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';

 export default class Header extends Component {
  render() {
    return (
      <div className='header-page w-100'>
        <nav className="navbar navbar-expand-lg navbar-dark">
          <NavLink className="inactive text-white navbar-brand f-24 flex-container-h" activeClassName="active text-white" to="/">
            <img src="/public/images/snow-notes.png" width="35" height="35" className="mr-3" alt="" />
            FI Planner
          </NavLink>
          {/*<a className="navbar-brand f-24 flex-container-h" href="#">
            <img src="/public/images/snow-notes.png" width="35" height="35" className="mr-3" alt="" />
            FI Planner
          </a>*/}
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse flex-end" id="navbarNavDropdown">
            <ul className="navbar-nav f-16">
              <li className="nav-item active">
                <a className="nav-link" href="#">Journal<span className="sr-only">(current)</span></a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Features</a>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  Dropdown
                </a>
                <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                  <a className="dropdown-item" href="#">Action</a>
                  <a className="dropdown-item" href="#">Another action</a>
                </div>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    );
  }
}