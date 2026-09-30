import { createBrowserRouter } from 'react-router';
import CreateOrgPage from '@/features/orgs/CreateOrgPage';
import DashboardPage from '@/features/orgs/DashboardPage';
import MembersPage from '@/features/members/MembersPage';
import ProjectDetailPage from '@/features/projects/ProjectDetailPage';
import ProjectsPage from '@/features/projects/ProjectsPage';
import LoginPage from '@/features/auth/LoginPage';
import RegisterPage from '@/features/auth/RegisterPage';
import GuestOnly from './GuestOnly';
import NotFoundPage from './NotFoundPage';
import OrgLayout from './OrgLayout';
import RequireAuth from './RequireAuth';
import Root from './Root';
import RootRedirect from './RootRedirect';
import RouteError from './RouteError';
import LandingPage from '@/features/landing/LandingPage';

export const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <LandingPage /> },
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
          { path: '/app', element: <RootRedirect /> },
          { path: '/orgs/new', element: <CreateOrgPage /> },
          // Org routes are added below this line.
          {
            path: '/o/:orgSlug',
            element: <OrgLayout />,
            children: [
              { index: true, element: <DashboardPage /> },
              // Org child routes are added below this line.
              { path: 'projects', element: <ProjectsPage /> },
              { path: 'projects/:projectId', element: <ProjectDetailPage /> },
              { path: 'members', element: <MembersPage /> },
            ],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
