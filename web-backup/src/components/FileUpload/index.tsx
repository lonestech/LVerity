import { InboxOutlined } from '@ant-design/icons';
import { message, Upload, Spin } from 'antd';
import type { UploadProps } from 'antd';
import { useState } from 'react';

interface FileUploadProps extends Omit<UploadProps, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  maxSize?: number; // 单位：MB
  accept?: string;
}

export default function FileUpload({ 
  value,
  onChange,
  maxSize = 10,
  accept,
  ...props 
}: FileUploadProps) {
  const [loading, setLoading] = useState(false);

  const handleChange: UploadProps['onChange'] = async (info) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      setLoading(false);
      onChange?.(info.file.response.url);
      message.success(`${info.file.name} 上传成功`);
    } else if (info.file.status === 'error') {
      setLoading(false);
      message.error(`${info.file.name} 上传失败`);
    }
  };

  const beforeUpload = (file: File) => {
    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      message.error(`文件必须小于 ${maxSize}MB!`);
      return false;
    }
    return true;
  };

  return (
    <Spin spinning={loading}>
      <Upload.Dragger
        name="file"
        multiple={false}
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        accept={accept}
        {...props}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">
          {value ? '当前已上传文件，再次上传将覆盖原文件' : `支持单个文件上传，文件大小不超过 ${maxSize}MB`}
        </p>
      </Upload.Dragger>
    </Spin>
  );
}
