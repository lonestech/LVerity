import { ProLayout } from '@ant-design/pro-components';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { Suspense, useEffect, useState } from 'react';
import { publicRoutes, routes } from './routes';
import { userService } from './services/user';

// 权限验证组件
const PrivateRoute = ({ element }: { element: React.ReactNode }) => {
  const currentUser = userService.getCurrentUser();
  
  // 如果没有登录，重定向到登录页面
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{element}</>;
};

export default function App() {
  const location = useLocation();
  const [isLoginPage, setIsLoginPage] = useState(false);

  useEffect(() => {
    setIsLoginPage(location.pathname === '/login');
  }, [location.pathname]);

  // 如果是登录页面，不显示布局
  if (isLoginPage) {
    return (
      <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}><Spin size="large" /></div>}>
        <Routes>
          {publicRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    );
  }

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
      <Suspense fallback={<div style={{ padding: 24, textAlign: 'center' }}><Spin size="large" /></div>}>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<PrivateRoute element={route.element} />}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ProLayout>
  );
}
