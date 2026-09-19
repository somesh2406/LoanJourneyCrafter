import { RouterProvider } from '@tanstack/react-router';
import { router } from '../router/router';

export function AppProviders() {
  return <RouterProvider router={router} />;
}
