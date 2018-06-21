import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';
import Client from './client'
import Controller from './controller';
import './App.css';

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Route exact path="/" component={Client}/>
          <Route path="/controller" component={Controller}/>
        </div>
      </Router>
    );
  }
}

export default App;
