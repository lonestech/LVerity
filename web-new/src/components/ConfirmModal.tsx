import React from 'react';
import { Modal, Typography } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ConfirmModalProps {
  /**
   * 是否显示模态框
   */
  visible: boolean;
  /**
   * 标题
   */
  title: string;
  /**
   * 确认内容
   */
  content: React.ReactNode;
  /**
   * 确认按钮文字
   */
  okText?: string;
  /**
   * 取消按钮文字
   */
  cancelText?: string;
  /**
   * 确认按钮是否为危险操作
   */
  danger?: boolean;
  /**
   * 加载中状态
   */
  loading?: boolean;
  /**
   * 确认回调
   */
  onOk: () => void;
  /**
   * 取消回调
   */
  onCancel: () => void;
}

/**
 * 确认对话框组件
 * 用于危险操作的二次确认
 */
const ConfirmModal: React.FC<ConfirmModalProps> = ({
  visible,
  title,
  content,
  okText = '确认',
  cancelText = '取消',
  danger = false,
  loading = false,
  onOk,
  onCancel,
}) => {
  return (
    <Modal
      title={(
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ExclamationCircleOutlined style={{ color: danger ? '#ff4d4f' : '#faad14', marginRight: 8 }} />
          <span>{title}</span>
        </div>
      )}
      open={visible}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{ danger, loading }}
      onOk={onOk}
      onCancel={onCancel}
    >
      {typeof content === 'string' ? <Text>{content}</Text> : content}
    </Modal>
  );
};

export default ConfirmModal;
