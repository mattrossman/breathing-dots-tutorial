import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import './base.css'
import Demo1 from './demos/Demo1'
import Demo2 from './demos/Demo2'

// Demos inspired by:
// https://twitter.com/beesandbombs/status/1329796242298245124

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/demo1">
          <Demo1 />
        </Route>
        <Route path="/demo2">
          <Demo2 />
        </Route>
        <Route path="*">
          <Redirect to="/demo1" />
        </Route>
      </Switch>
    </Router>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
