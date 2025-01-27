import { QuestionCircleOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Space } from 'antd';
import React from 'react';
import HeaderSearch from '../HeaderSearch';
import Avatar from './AvatarDropdown';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {
  const { initialState } = useModel('@@initialState');

  if (!initialState || !initialState.settings) {
    return null;
  }

  const { navTheme, layout } = initialState.settings;
  let className = 'right';

  if ((navTheme === 'realDark' && layout === 'top') || layout === 'mix') {
    className = `right dark`;
  }

  return (
    <Space className={className}>
      <HeaderSearch
        className="search-input"
        placeholder="站内搜索"
        defaultValue=""
        options={[]}
      />
      <span
        className="help"
        onClick={() => {
          window.open('https://pro.ant.design/docs/getting-started');
        }}
      >
        <QuestionCircleOutlined />
      </span>
      <Avatar />
    </Space>
  );
};

export default GlobalHeaderRight;
