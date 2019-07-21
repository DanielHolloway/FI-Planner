import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';

import Start from './Start';
import PhotoCred from './PhotoCred';
import Login from './Login';

import { userActions } from '../actions';

class Home extends Component {
   componentDidMount() {
      this.props.dispatch(userActions.getAll());
   }

   render() {
      const { user, users, logFlag } = this.props;
      console.log("rendered in Home jsx:",user, users,logFlag);
      return (
         <div>
            <div className="bg">
               <div className="h-100 w-100 flex-container">
                  <div className="w-100 d-flex flex-row align-items-end justify-content-end">
                  {logFlag ? (
                     <div className="w-25 mt-1">
                        <div className="text-white d-flex flex-column align-items-end flex-end p-3 f-2">
                           <p>Hi {user.first_name + " " + user.last_name} </p>
                           <p>
                              <NavLink className="inactive text-white" activeClassName="active text-white" to="/login">Logout</NavLink>
                           </p>
                        </div>
                     </div>
                  ) : (
                     <Login />
                  )}
                     
                  </div>
                  <div className="h-95 w-100 flex-center-column">
                     <h1 className="text-white">FI Planner</h1>
                     <h4 className="text-white">Where the savings are real</h4>
                     <div className="p-2">
                        {/*<Start history={this.props.history} />*/}

                        <div className="d-flex flex-wrap justify-content-center align-items-center align-content-center">
                           <div className="btn-group">
                              <h2>
                                 <span onClick={this.start} className="badge badge-pill badge-primary cursor-pointer skyback p-3 font-weight-normal">
                                    <NavLink className="inactive text-white" activeClassName="active text-white" to="/journal">Get Started</NavLink>
                                 </span>
                              </h2>
                           </div>
                        </div>
                     </div>
                  </div>
                  <div className="w-100 p-2 flex-bottom-right">
                     <PhotoCred page={'home'} />
                  </div>
               </div>
            </div>

            {/*<div>
               <p className="py-5 text-center">This example creates a full page background image. Try to resize the browser window to see how it always will cover the full screen (when scrolled to top), and that it scales nicely on all screen sizes.</p>
            </div>*/}
         </div>
         
      )
   }
}

function mapStateToProps(state) {
    const { users, authentication } = state;
    const { user } = authentication;
    var logFlag = state.authentication.loggedIn;
    console.log("SKRRT, SKRRT",user,logFlag,state.authentication.loggedIn,state);
    return {
        user,
        users,
        logFlag
    };
}

const connectedHome = connect(mapStateToProps)(Home);
export { connectedHome as Home };