import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import App from './App' 
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext'; 

createRoot(document.getElementById('root')).render(
    <ThemeProvider> 
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
)