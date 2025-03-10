import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import LicensePage from './index';
import LicenseForm from './form';
import LicenseDetail from './detail';

// 创建QueryClient实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

const LicenseRouter: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<LicensePage />} />
        <Route path="/form" element={<LicenseForm mode="create" />} />
        <Route path="/form/:id" element={<LicenseForm mode="edit" />} />
        <Route path="/detail/:id" element={<LicenseDetail />} />
        <Route path="*" element={<Navigate to="/license" replace />} />
      </Routes>
    </QueryClientProvider>
  );
};

export default LicenseRouter;
