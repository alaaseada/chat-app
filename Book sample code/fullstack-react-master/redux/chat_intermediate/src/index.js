import React from 'react';
import * as ReactDOM from 'react-dom/client';
// Readers: To prepare this project for building along in `./App.js`:
// [1] Comment out this line:
// import App from "./complete/App-17";
// [2] Un-comment this line:
import App from './App';

import './index.css';
import './semantic-dist/semantic.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
