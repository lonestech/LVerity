import { useState } from 'react';
import { theme } from 'antd';

export type ContentWidth = 'Fluid' | 'Fixed';

export type LayoutSettings = {
  navTheme: 'light' | 'dark';
  colorPrimary: string;
  layout: 'side' | 'top' | 'mix';
  contentWidth: ContentWidth;
  fixedHeader: boolean;
  fixSiderbar: boolean;
  splitMenus: boolean;
};

const defaultSettings: LayoutSettings = {
  navTheme: 'light',
  colorPrimary: '#1890ff',
  layout: 'side',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  splitMenus: false,
};

export default function useSettings() {
  const [settings, setSetting] = useState<Partial<LayoutSettings>>({
    ...defaultSettings,
  });

  const changeSetting = (key: keyof LayoutSettings, value: LayoutSettings[keyof LayoutSettings]) => {
    const nextState = { ...settings };
    nextState[key] = value;
    setSetting(nextState);
  };

  const getThemeToken = () => {
    return {
      token: {
        colorPrimary: settings.colorPrimary,
      },
    };
  };

  return {
    settings,
    changeSetting,
    getThemeToken,
  };
}
