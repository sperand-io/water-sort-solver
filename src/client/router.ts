import App from '@/client/App';
import SolverPage from '@/client/components/SolverPage';
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';

// Define the root route
const rootRoute = createRootRoute({
  component: App,
});

// Create routes
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: SolverPage,
});

// Define router
const routeTree = rootRoute.addChildren([
  homeRoute,
]);

// Create and export the router
export const router = createRouter({ routeTree });

// Register the types for the router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}