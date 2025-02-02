import { DownOutlined } from '@ant-design/icons';
import { Dropdown, Button, Space } from 'antd';
import type { MenuProps } from 'antd';
import { ReactNode, useState } from 'react';

export interface FilterOption {
  label: ReactNode;
  value: string | number;
  children?: FilterOption[];
}

interface FilterDropdownProps {
  options: FilterOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
}

export default function FilterDropdown({
  options,
  value,
  onChange,
  placeholder = '请选择',
}: FilterDropdownProps) {
  const [selectedKey, setSelectedKey] = useState<string | number | undefined>(value);

  const findLabel = (key: string | number | undefined): ReactNode => {
    if (!key) return placeholder;
    const findOption = (opts: FilterOption[]): ReactNode => {
      for (const opt of opts) {
        if (opt.value === key) return opt.label;
        if (opt.children) {
          const found = findOption(opt.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findOption(options) || placeholder;
  };

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const value = e.key;
    setSelectedKey(value);
    onChange?.(value);
  };

  const convertToMenuItems = (options: FilterOption[]): MenuProps['items'] => {
    return options.map((option) => ({
      key: option.value,
      label: option.label,
      children: option.children ? convertToMenuItems(option.children) : undefined,
    }));
  };

  return (
    <Dropdown
      menu={{
        items: convertToMenuItems(options),
        onClick: handleMenuClick,
        selectedKeys: selectedKey ? [selectedKey.toString()] : [],
      }}
    >
      <Button>
        <Space>
          {findLabel(selectedKey)}
          <DownOutlined />
        </Space>
      </Button>
    </Dropdown>
  );
}
