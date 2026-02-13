import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {console.log('App version: Fixed API URL 2.0')}
    <App />
  </React.StrictMode>
)