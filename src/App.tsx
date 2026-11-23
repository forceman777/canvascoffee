import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { CartProvider } from './state/CartContext';
import { ToastProvider } from './state/ToastContext';
import Home from './pages/Home';

// Home is in the main bundle for the fastest first view; other pages load on demand.
const Story = lazy(() => import('./pages/Story'));
const Menu = lazy(() => import('./pages/Menu'));
const Order = lazy(() => import('./pages/Order'));
const Reservations = lazy(() => import('./pages/Reservations'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

const page = (el: React.ReactNode) => <Suspense fallback={<div className="page-loading" aria-busy="true" />}>{el}</Suspense>;

const router = createBrowserRouter([
  {
    element: (
      <ToastProvider>
        <Layout />
      </ToastProvider>
    ),
    children: [
      { path: '/', element: <Home /> },
      { path: '/story', element: page(<Story />) },
      { path: '/menu', element: page(<Menu />) },
      { path: '/order', element: page(<Order />) },
      { path: '/reservations', element: page(<Reservations />) },
      { path: '/gallery', element: page(<Gallery />) },
      { path: '/contact', element: page(<Contact />) },
      { path: '*', element: page(<NotFound />) },
    ],
  },
]);

export default function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}
