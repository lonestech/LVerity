import { Modal, ModalProps } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ConfirmModalProps extends Omit<ModalProps, 'onOk'> {
  onOk: () => Promise<void>;
}

export default function ConfirmModal({ 
  title = '确认操作', 
  onOk,
  children,
  ...props 
}: ConfirmModalProps) {
  return (
    <Modal
      title={
        <span>
          <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
          {title}
        </span>
      }
      okText="确认"
      cancelText="取消"
      onOk={async () => {
        try {
          await onOk();
        } catch (error) {
          // 错误处理由调用者通过 catch 处理
          throw error;
        }
      }}
      {...props}
    >
      {children}
    </Modal>
  );
}
