import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LicensePage from './index';
import LicenseForm from './form';
import LicenseDetail from './detail';

const LicenseRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LicensePage />} />
      <Route path="/form" element={<LicenseForm mode="create" />} />
      <Route path="/form/:id" element={<LicenseForm mode="edit" />} />
      <Route path="/detail/:id" element={<LicenseDetail />} />
      <Route path="*" element={<Navigate to="/license" replace />} />
    </Routes>
  );
};

export default LicenseRouter;
