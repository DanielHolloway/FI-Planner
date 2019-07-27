import axios from 'axios';
import { userActions } from '../actions';
//import { authOperations } from 'where you keep your actions/operations';
// whats a tutorial without an obscure authService :)
//import authService from './authService';


const httpService = {
// we pass the redux store and history in order to dispatch the logout actions 
// and push the user to login

  setupInterceptors: (store, history) => {
    console.log("checking axios");


    axios.interceptors.response.use((response) => {
        // simply return the response if there is no error

        console.log("checking axios",response);
        return response;
    }, (error) => {
    // in this case we only care about unauthorized errors
    
        console.log("checking axios",error);

        if (error.response.status === 401) {
            // we dispatch our logout action (more than likely changes a boolean 
            // somewhere in your store ex. isAuthenticated: false)
            store.dispatch(userActions.logout());
            // this could just as easily be localStorage.removeItem('your-token')
            // but it's best to encapsulate this logic so it can be used elsewhere
            // by just importing it.
            //authService.removeToken();
            localStorage.removeItem('user');
            // send the user to the login page since the user/token is not valid
            history.push('/login');
        }
        return Promise.reject(error);
    });
  }
};
export default httpService;