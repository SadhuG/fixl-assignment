import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import SetupCheck from './SetupCheck';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SetupCheck />
  </StrictMode>,
);
