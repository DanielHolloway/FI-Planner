import React, { Component } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { connect } from 'react-redux';

import Start from './Start';
import PhotoCred from '../components/PhotoCred';

import { userActions } from '../actions';

class Home extends Component {
   constructor(props) {
       super(props);

       // reset login status
       //this.props.dispatch(userActions.logout());

       this.state = {
           username: '',
           password: '',
           submitted: false,
           badLogin: false,
           lockOut: false
       };

       this.handleChange = this.handleChange.bind(this);
       this.handleSubmit = this.handleSubmit.bind(this);
   }
   
   componentDidMount() {
      //this.props.dispatch(userActions.getAll());
      console.log(this.props);
      if(!this.props.logFlag){
         /*const requestOptions = {
             method: 'GET',
             //headers: authHeader()
         };
         return fetch('/fuck', requestOptions).then(function(response){
            console.log(response);
         });*/
         //uncomment for refresh
         this.props.dispatch(userActions.refresh());
      }
   }

   handleChange(e) {
       const { name, value } = e.target;
       this.setState({ [name]: value });
   }

   handleSubmit(e) {
      e.preventDefault();

      if(this.state.username == '' || this.state.password == ''){
         this.setState({ submitted: true });
         return;
      }

      fetch('/api/Login', {
           method: 'POST',
           headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/json',
               "content-type": "API-Key",
           },
           credentials: "include",
           body: JSON.stringify({
               password_hash: this.state.password,
               user_name: this.state.username
           })
      })
      .then((response) => {
         console.log(response.headers);
         if(response.status == 403){
            this.setState({ lockOut: true });
         }
         if(!response.ok) throw new Error(response.status);
         else return response.json();
      })
      .then((data) => {
         console.log("DATA STORED",data);
         this.setState({ submitted: true, badLogin: false, lockOut: false });
         const { username, password } = this.state;
         const { dispatch } = this.props;
         console.log(username,password,this.props);
         if (username && password) {
            dispatch(userActions.login(username, password));
         }
      })
      .catch((error) => {
           console.log('error: ' + error);
           this.setState({ badLogin: true });
      });       
   }
   
   logOut() {
      // reset login status
      console.log("logging out");
      this.props.dispatch(userActions.logout());
      this.setState(
         {
            username: '',
            password: '',
            submitted: false,
            badLogin: false
         }
      );
   }

   render() {
      const { loggingIn } = this.props;
      const { username, password, submitted, badLogin, lockOut } = this.state;
      const { user, users, logFlag } = this.props;
      return (
         <div>
            <div className="bg">
               <div className="h-100 w-100 flex-container">
                  <div className="w-100 d-flex flex-row align-items-end justify-content-end">
                  {logFlag ? (
                     <div className="w-50 mt-1">
                        <div className="text-white d-flex flex-column align-items-end flex-end p-3 f-2">
                           <p>Hi {user.first_name + " " + user.last_name} </p>
                           <p className="cursor-pointer" onClick={ (e) => this.logOut() }>
                              Logout
                           </p>
                        </div>
                     </div>
                  ) : (
                     <div className="w-50 mt-1">
                        <form name="form" onSubmit={this.handleSubmit} className="text-white d-flex flex-column flex-even">
                           <div className="d-flex flex-row flex-even align-items-center">
                              <div className={'' + (submitted && !username ? ' has-error' : '')}>
                                    <label htmlFor="username">Username</label>
                                    <input type="text" className="form-control" name="username" value={username} onChange={this.handleChange} />
                                    
                              </div>
                              <div className={'' + (submitted && !password ? ' has-error' : '')}>
                                    <label htmlFor="password">Password</label>
                                    <input type="password" className="form-control" name="password" value={password} onChange={this.handleChange} />
                                    
                              </div>
                              <div className="align-self-flex-end">
                                    <button className="btn btn-primary skyback">Login</button>
                                    {loggingIn &&
                                       <img src="data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==" />
                                    }
                              </div>
                              
                           </div>
                           <div className="flex-row">
                              {submitted && (!username || !password) &&
                                 <div className="help-block">Username and password are required</div>
                              }
                              {badLogin && !lockOut &&
                                 <div className="help-block">Username or password is invalid.</div>
                              }
                              {lockOut &&
                                 <div className="help-block">You have been temporarily prevented from logging in.</div>
                              }
                           </div>
                        </form>
                     </div>
                  )}
                     
                  </div>
                  <div className="h-95 w-100 flex-center-column">
                     <h1 className="text-white">FI Planner</h1>
                     <h4 className="text-white">Where the savings are real</h4>
                     <div className="p-2">
                        <Start history={this.props.history} logFlag={this.props.logFlag} />

                        {/*<div className="d-flex flex-wrap justify-content-center align-items-center align-content-center">
                           <div className="btn-group">
                              <h2>
                                 <span onClick={this.start} className="badge badge-pill badge-primary cursor-pointer skyback p-3 font-weight-normal">
                                    <NavLink className="inactive text-white" activeClassName="active text-white" to="/journal">Get Started</NavLink>
                                 </span>
                              </h2>
                           </div>
                        </div>*/}
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
    console.log("mapped state",user);
    return {
        user,
        users,
        logFlag
    };
}

const connectedHome = connect(mapStateToProps)(Home);
export { connectedHome as Home };