import { createHashHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { rootRoute } from '@/routes/__root';
import { indexRoute } from '@/routes/_public/index';
import './index.css';

const routeTree = rootRoute.addChildren([indexRoute]);

// Hash history: GitHub Pages has no SPA fallback, so deep links and refreshes
// must not hit the server (ADR-0004).
const router = createRouter({ routeTree, history: createHashHistory() });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('#root is missing from index.html');

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
