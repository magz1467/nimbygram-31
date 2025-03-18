import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Index from './pages/Index';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <div className="p-4 bg-red-100">Error loading route</div>,
    children: [
      {
        index: true,
        element: <Index />,
        errorElement: <div className="p-4 bg-red-100">Error loading Index</div>,
      }
    ]
  }
], {
  basename: '/',
});
