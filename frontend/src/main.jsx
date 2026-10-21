import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import Providers from './redux/provider/Providers'
import 'react-datepicker/dist/react-datepicker.css'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Providers>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 2800, style: { borderRadius: '12px', color: '#17203b' } }} />
      </BrowserRouter>
    </Providers>
  </StrictMode>,
)
