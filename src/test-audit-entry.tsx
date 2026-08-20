import React from 'react';
import ReactDOM from 'react-dom/client';
import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { SocialFeedView } from './views/SocialFeedView';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider><CurrencyProvider>
      <div style={{ minHeight: '100vh', background: '#0a0b0d' }}>
        <SocialFeedView onNotify={()=>{}} />
      </div>
    </CurrencyProvider></LanguageProvider>
  </React.StrictMode>
);
