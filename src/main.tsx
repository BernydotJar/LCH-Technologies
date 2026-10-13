import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { LocaleProvider } from './i18n/LocaleProvider';
import { ThemeProvider } from './theme/ThemeProvider';
import { AnalyticsProvider } from './analytics/AnalyticsProvider';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LocaleProvider>
      <ThemeProvider>
        <AnalyticsProvider>
          <App />
        </AnalyticsProvider>
      </ThemeProvider>
    </LocaleProvider>
  </StrictMode>,
);
