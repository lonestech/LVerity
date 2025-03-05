import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { ReactNode } from 'react';

interface ConfirmModalProps {
  title?: string;
  content?: ReactNode;
  visible: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  confirmLoading?: boolean;
  children?: ReactNode;
}

export default function ConfirmModal({ 
  title = '确认操作', 
  content,
  visible,
  onConfirm,
  onCancel,
  confirmLoading,
  children
}: ConfirmModalProps) {
  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
          {title}
        </span>
      }
      open={visible}
      okText="确认"
      cancelText="取消"
      confirmLoading={confirmLoading}
      onOk={async () => {
        try {
          await onConfirm();
        } catch (error) {
          // 错误处理由调用者通过 catch 处理
          throw error;
        }
      }}
      onCancel={onCancel}
    >
      {children || content}
    </Modal>
  );
}
