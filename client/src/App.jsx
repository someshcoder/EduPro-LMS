import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRouter from './routes/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(71, 85, 105, 0.4)',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#1e293b' },
          },
        }} 
      />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
