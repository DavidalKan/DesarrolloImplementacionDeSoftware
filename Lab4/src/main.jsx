import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Salt from './Salt.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Salt></Salt>
  </StrictMode>,
)
