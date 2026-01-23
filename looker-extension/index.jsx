import React from 'react';
import ReactDOM from 'react-dom/client';
import MLPredictorExtension from './MLPredictorExtension';

// The Looker Extension API will provide the context
let hostUrl = process.env.REACT_APP_HOST_URL || 'http://localhost:8080';

// Initialize Looker Extension
const initializeLookerExtension = () => {
  // In a real Looker environment, the extension SDK would be available
  if (window.looker_extension_sdk) {
    hostUrl = window.lookerExtensionHostUrl || hostUrl;
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <MLPredictorExtension hostUrl={hostUrl} />
    </React.StrictMode>
  );
};

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLookerExtension);
} else {
  initializeLookerExtension();
}
