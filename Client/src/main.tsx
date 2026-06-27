import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store.ts'
import { SocketProvider } from './context/SocketContext.tsx'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Auto-register service worker and prompt for reload when new build is detected
registerSW({
  onNeedRefresh() {
    if (confirm('A new version of Syncro is available! Reload now?')) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log('Syncro PWA is ready for offline usage.');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <App />
      </SocketProvider>
    </Provider>
  </StrictMode>,
)
