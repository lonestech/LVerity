import { ProLayout } from '@ant-design/pro-components';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { routes } from './routes';

export default function App() {
  const location = useLocation();

  return (
    <ProLayout
      title="LVerity"
      location={{
        pathname: location.pathname,
      }}
      route={{
        routes,
      }}
      menuItemRender={(item, dom) => (
        <Link to={item.path ?? '/'}>{dom}</Link>
      )}
    >
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
    </ProLayout>
  );
}
