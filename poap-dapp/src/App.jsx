import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { Layout } from '@/components';
import { useGetIsLoggedIn } from '@/lib/sdkDapp/sdkDapp.hooks';
import { PageNotFound } from '@/pages';
import { routes } from '@/routes/routes';
import './App.css';

const AuthenticatedRoute = (props) => {
  const isLoggedIn = useGetIsLoggedIn();
  const location = useLocation();

  if (props.authenticatedRoute && !isLoggedIn) {
    const redirectTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/?redirect=${redirectTo}`} replace />;
  }

  const { component: RouteComponent } = props;
  return <RouteComponent />;
};

export const App = () => {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Layout>
        <Routes>
          {routes.map((route) => (
            <Route
              key={`route-key-${route.path}`}
              path={route.path}
              element={
                <AuthenticatedRoute
                  component={route.component}
                  authenticatedRoute={route.authenticatedRoute}
                />
              }
            >
              {route.children?.map((child) => (
                <Route
                  key={`route-key-${route.path}-${child.path}`}
                  path={child.path}
                  element={
                    <AuthenticatedRoute
                      component={child.component}
                      authenticatedRoute={child.authenticatedRoute}
                    />
                  }
                />
              ))}
            </Route>
          ))}
          <Route path='*' element={<PageNotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;