import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";

import './assets/styles/main.scss';

import AdminLayoutContainer from "./components/containers/layouts/AdminLayoutContainer";
import DashboardTheme from "./components/amplify/DashboardTheme";

import { withAuthenticator } from '@aws-amplify/ui-react'


const App=()=>{
 
  return(
    <BrowserRouter>
      <Switch>
        <Route path="/admin" render={(props) => <AdminLayoutContainer {...props} />} />
        <Redirect from="/" to="/admin/dashboard" />
      </Switch>
    </BrowserRouter>
  );
}

export default withAuthenticator(App,false, [], null, DashboardTheme);


