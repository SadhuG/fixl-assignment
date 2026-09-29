import { createBrowserRouter } from 'react-router';
import CreateOrgPage from '@/features/orgs/CreateOrgPage';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import GuestOnly from './GuestOnly';
import NotFoundPage from './NotFoundPage';
import RequireAuth from './RequireAuth';
import Root from './Root';
import RootRedirect from './RootRedirect';
import RouteError from './RouteError';

export const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      {
        path: '/login',
        element: (
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        ),
      },
      {
        path: '/register',
        element: (
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        ),
      },
      {
        element: <RequireAuth />,
        children: [
          { path: '/', element: <RootRedirect /> },
          { path: '/orgs/new', element: <CreateOrgPage /> },
          // Org routes are added below this line.
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
