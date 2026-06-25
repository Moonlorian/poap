import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/App.jsx';
import { walletConnectV2ProjectId } from '@/config';
import { initApp } from '@/lib/sdkDapp/sdkDapp.methods';
import { EnvironmentsEnum } from '@/lib/sdkDapp/sdkDapp.types';
import './index.css';

const config = {
  storage: { getStorageCallback: () => sessionStorage },
  dAppConfig: {
    environment: EnvironmentsEnum.devnet,
    transactionTracking: {
      successfulToastLifetime: 5000,
      onSuccess: async (sessionId) => {
        console.log('Transaction session successful', sessionId);
      },
      onFail: async (sessionId) => {
        console.log('Transaction session failed', sessionId);
      }
    },
    providers: {
      walletConnect: {
        walletConnectV2ProjectId
      }
    }
  }
};

initApp(config).then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
