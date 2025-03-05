import React, { ReactNode } from 'react';
import { PageContainer as AntPageContainer } from '@ant-design/pro-components';
import { Spin } from 'antd';

interface PageContainerProps {
  title?: string;
  subTitle?: string;
  breadcrumb?: { path: string; breadcrumbName: string }[];
  loading?: boolean;
  extra?: ReactNode;
  children: ReactNode;
}

/**
 * 页面容器组件
 */
const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subTitle,
  breadcrumb,
  loading = false,
  extra,
  children,
}) => {
  return (
    <AntPageContainer
      header={{
        title,
        subTitle,
        breadcrumb: breadcrumb
          ? {
              routes: breadcrumb,
            }
          : undefined,
        extra,
      }}
    >
      <Spin spinning={loading}>
        <div className="page-container">{children}</div>
      </Spin>
    </AntPageContainer>
  );
};

export default PageContainer;
