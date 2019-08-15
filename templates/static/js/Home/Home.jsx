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
         console.log(response.headers,response.status);
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
         console.log('error: ' + error,error,error.toString().includes('417'),error=='417');
         this.setState({ badLogin: true });
         if(error.toString().includes('417')){
            console.log('redirecting to verify');
            const { history } = this.props;
            history.push('/verify');
         }
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
         <div className="inner h-100">
               <div className="h-100 w-100 flex-container">
                  {logFlag && 
                     <div className="w-100 d-flex flex-row align-items-end flex-end">
                        <h3>
                           <div className="btn badge badge-primary p-2 m-4 font-weight-normal skyback" onClick={ (e) => this.logOut() }>
                              Logout
                           </div>
                        </h3>
                     </div>
                  }
                  <div className="h-95 w-100 flex-center-column">
                     <h1 className="text-white">FI Planner</h1>
                     <h4 className="text-white">Where the savings are real</h4>
                     <div className="d-flex flex-column">
                     {logFlag ? (
                        <div className="w-100 mt-5p">
                           <div className="text-white d-flex flex-column align-items-center p-3 f-2">
                              <p>Hi {user.first_name + " " + user.last_name} </p>
                           </div>
                        </div>
                     ) : (
                        <div className="w-100 mt-5p">
                           <form name="form" onSubmit={this.handleSubmit} className="text-white d-flex flex-column flex-even">
                              <div className="">
                                 <div className={'form-group ' + (submitted && !username ? ' has-error' : '')}>
                                       <label htmlFor="username">Username</label>
                                       <input type="text" className="form-control" name="username" value={username} onChange={this.handleChange} />
                                       
                                 </div>
                                 <div className={'form-group ' + (submitted && !password ? ' has-error' : '')}>
                                       <label htmlFor="password">Password</label>
                                       <input type="password" className="form-control" name="password" value={password} onChange={this.handleChange} />
                                       
                                 </div>
                                 <div className="d-flex justify-content-center">
                                       <h3><button className="btn badge badge-primary p-2 font-weight-normal skyback">Login</button></h3>
                                       
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
                     {!logFlag && 
                        <h4 className="text-white my-4">- or -</h4>
                     }
                     <div className="p-2">
                        <Start history={this.props.history} logFlag={this.props.logFlag} />
                     </div>
                  </div>
                  <div className="w-100 p-2 flex-bottom-right">
                     <PhotoCred page={'home'} />
                  </div>
               </div>
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