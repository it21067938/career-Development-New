import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from "react-router-dom";
import App from './App.tsx'
import { ToastProvider } from './contexts/ToastContext.tsx';
import { ThemeProvider } from './contexts/ThemeContext.tsx'; 

createRoot(document.getElementById('root')!).render(
    <ThemeProvider> 
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
)