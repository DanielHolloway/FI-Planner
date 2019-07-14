import React, { Component } from 'react';
import Start from './Start';
import PhotoCred from './PhotoCred';
import Login from './Login';
export default class Home extends Component {
   render() {
      return (
         <div>
            <div className="bg">
               <div className="h-100 w-100 flex-container">
                  <div className="w-100 d-flex flex-row align-items-end justify-content-end">
                     <Login />
                  </div>
                  <div className="h-95 w-100 flex-center-column">
                     <h1 className="text-white">FI Planner</h1>
                     <h4 className="text-white">Where the savings are real</h4>
                     <div className="p-2"><Start history={this.props.history} /></div>
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