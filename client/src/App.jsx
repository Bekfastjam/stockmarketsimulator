import React from 'react';
import { Route, Switch } from 'wouter';
import Dashboard from './pages/dashboard.jsx';
import NotFound from './pages/not-found.jsx';

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default App; 