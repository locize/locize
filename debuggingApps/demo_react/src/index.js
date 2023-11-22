import React from 'react'
import ReactDOM from 'react-dom'

// import this after other CSS so we override CSS
import App from './App'

import './i18n'

import './index.css'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
