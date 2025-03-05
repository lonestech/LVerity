import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import UserList from './index';
import PasswordChange from './PasswordChange';

// 用户模块路由组件
const UserRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<UserList />} />
      <Route path="/change-password" element={<PasswordChange />} />
      {/* 其他可能的用户相关路由，如用户详情、编辑用户等 */}
      <Route path="*" element={<Navigate to="/user" replace />} />
    </Routes>
  );
};

export default UserRouter;
