import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter as Router, Switch, Route, Redirect, Link } from 'react-router-dom'
import './base.css'
import Demo1 from './demos/Demo1'
import Demo2 from './demos/Demo2'

// Demos inspired by:
// https://twitter.com/beesandbombs/status/1329796242298245124

function App() {
  return (
    <Router basename="/">
      <div className="frame">
        <h1 className="frame__title">
          Recreating a <a href="https://twitter.com/beesandbombs/status/1329796242298245124">Dave Whyte</a> Animation <br />
          in React-Three-Fiber
        </h1>
        <div className="frame__links">
          <a href="https://tympanus.net/Development/HorizontalSmoothScrollLayout/">Previous demo</a>
          <a href="https://tympanus.net/codrops/?p=52356">Article</a>
          <a href="https://github.com/mattrossman/breathing-dots-tutorial">GitHub</a>
        </div>
        <div className="frame__author">
          Made by <a href="https://twitter.com/the_ross_man">Matt Rossman</a>
        </div>
        <div className="frame__demos">
          <Link to="/demo1" className="frame__demo">
            Infinite Loop
          </Link>
          <Link to="/demo2" className="frame__demo">
            Interactive (press/hold & release)
          </Link>
        </div>
      </div>
      <div className="content">
        <h2 className="content__title">Spirit of Rhythm</h2>
      </div>
      <div id="animation">
        <Switch>
          <Route exact path="/demo1">
            <Demo1 />
          </Route>
          <Route exact path="/demo2">
            <Demo2 />
          </Route>
          <Route path="*">
            <Redirect to="/demo1" />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
