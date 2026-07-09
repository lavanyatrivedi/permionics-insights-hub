import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';

import './index.css';

// For production builds (like on Vercel), point API calls to the remote backend
const apiUrl = import.meta.env.VITE_API_URL || 'https://permionics-insights-hub-api.onrender.com';
if (import.meta.env.PROD) {
  setBaseUrl(apiUrl);
}

createRoot(document.getElementById('root')!).render(<App />);
