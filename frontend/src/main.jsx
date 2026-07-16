import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

// Use a placeholder or environment variable for the real client ID
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "132721264540-a2794sbnqvens788p1tqe26asn0q1i9r.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
