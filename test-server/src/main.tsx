import { scan } from 'react-scan';

import * as React from 'react';
import * as ReactDOM from 'react-dom/client';

import { App } from '@/src/components/core/App';

import '@/src/main.css';

//

scan({
  enabled: true,
});

//

const root = document.getElementById('root');

if (!root)
  throw new Error('Root element not found');

//

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
