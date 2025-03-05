import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Input, 
  Tree, 
  Tabs, 
  List, 
  Button, 
  Space, 
  Tag, 
  Collapse,
  Avatar,
  Breadcrumb,
  Alert,
  Divider
} from 'antd';
import { 
  SearchOutlined, 
  QuestionCircleOutlined, 
  BookOutlined, 
  VideoCameraOutlined, 
  ToolOutlined,
  FileTextOutlined,
  RightOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import PageContainer from '../../components/PageContainer';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { helpDocService } from '../../services/helpDoc';
import helpCenterData from './helpCenterData';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { TreeNode } = Tree;
const { TabPane } = Tabs;
const { Panel } = Collapse;

const HelpCenter: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'guide');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [currentDoc, setCurrentDoc] = useState<any>(helpCenterData.guides.find(item => item.key === 'overview'));
  
  const navigate = useNavigate();

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    navigate(`/help?tab=${key}`);
    setSelectedKeys([]);
    setCurrentDoc(null);
  };

  // 处理文档树选择
  const handleTreeSelect = (selectedKeys: React.Key[], info: any) => {
    setSelectedKeys(selectedKeys);
    if (selectedKeys.length > 0) {
      let selected;
      if (activeTab === 'guide') {
        selected = helpCenterData.guides.find(item => item.key === selectedKeys[0]);
      } else if (activeTab === 'faq') {
        selected = helpCenterData.faqs.find(item => item.key === selectedKeys[0]);
      } else if (activeTab === 'api') {
        selected = helpCenterData.apis.find(item => item.key === selectedKeys[0]);
      }
      setCurrentDoc(selected);
    }
  };

  // 处理搜索
  const handleSearch = (value: string) => {
    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    
    setSearchValue(value);
    setIsSearching(true);
    
    // 从所有文档中搜索
    const results = [
      ...helpCenterData.guides,
      ...helpCenterData.faqs,
      ...helpCenterData.apis,
    ].filter(item => 
      item.title.toLowerCase().includes(value.toLowerCase()) || 
      item.content.toLowerCase().includes(value.toLowerCase())
    );
    
    setSearchResults(results);
  };

  // 处理点击搜索结果
  const handleSearchResultClick = (doc: any) => {
    setCurrentDoc(doc);
    setIsSearching(false);
    setSearchValue('');
    
    // 查找文档所在的标签
    let targetTab = 'guide';
    if (helpCenterData.faqs.find(item => item.key === doc.key)) {
      targetTab = 'faq';
    } else if (helpCenterData.apis.find(item => item.key === doc.key)) {
      targetTab = 'api';
    }
    
    setActiveTab(targetTab);
    setSelectedKeys([doc.key]);
  };

  // 渲染文档树
  const renderTree = () => {
    let data = [];
    
    if (activeTab === 'guide') {
      data = helpCenterData.guides;
    } else if (activeTab === 'faq') {
      data = helpCenterData.faqs;
    } else if (activeTab === 'api') {
      data = helpCenterData.apis;
    }
    
    // 转换为树形结构
    const treeData = [];
    const categories = {};
    
    data.forEach(item => {
      if (item.category) {
        if (!categories[item.category]) {
          categories[item.category] = {
            title: item.category,
            key: `category-${item.category}`,
            children: []
          };
          treeData.push(categories[item.category]);
        }
        
        categories[item.category].children.push({
          title: item.title,
          key: item.key,
        });
      } else {
        treeData.push({
          title: item.title,
          key: item.key,
        });
      }
    });
    
    return (
      <Tree
        showLine
        showIcon
        selectedKeys={selectedKeys as string[]}
        expandedKeys={expandedKeys as string[]}
        onSelect={handleTreeSelect}
        onExpand={(keys) => setExpandedKeys(keys)}
        treeData={treeData}
      />
    );
  };

  // 渲染当前文档内容
  const renderDocContent = () => {
    if (!currentDoc) {
      return (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <QuestionCircleOutlined style={{ fontSize: 64, color: '#1890ff', marginBottom: 24 }} />
          <Title level={3}>请从左侧菜单选择一个文档</Title>
          <Paragraph>或者使用搜索功能查找您需要的内容</Paragraph>
        </div>
      );
    }
    
    return (
      <div>
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>帮助中心</Breadcrumb.Item>
          <Breadcrumb.Item>
            {activeTab === 'guide' ? '用户指南' : 
             activeTab === 'faq' ? '常见问题' : 
             activeTab === 'api' ? 'API文档' : ''}
          </Breadcrumb.Item>
          {currentDoc.category && (
            <Breadcrumb.Item>{currentDoc.category}</Breadcrumb.Item>
          )}
          <Breadcrumb.Item>{currentDoc.title}</Breadcrumb.Item>
        </Breadcrumb>
        
        <Title level={2}>{currentDoc.title}</Title>
        
        {currentDoc.tags && currentDoc.tags.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            {currentDoc.tags.map((tag: string) => (
              <Tag key={tag} color="blue" style={{ marginRight: 8 }}>{tag}</Tag>
            ))}
          </div>
        )}
        
        {currentDoc.updatedAt && (
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            最后更新: {currentDoc.updatedAt}
          </Text>
        )}
        
        <div className="doc-content" dangerouslySetInnerHTML={{ __html: currentDoc.content }} />
        
        {currentDoc.relatedDocs && currentDoc.relatedDocs.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <Divider />
            <Title level={4}>相关文档</Title>
            <List
              itemLayout="horizontal"
              dataSource={currentDoc.relatedDocs}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<FileTextOutlined />}
                    title={<a onClick={() => {
                      const doc = [
                        ...helpCenterData.guides,
                        ...helpCenterData.faqs,
                        ...helpCenterData.apis,
                      ].find(d => d.key === item.key);
                      if (doc) {
                        handleSearchResultClick(doc);
                      }
                    }}>{item.title}</a>}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </div>
    );
  };

  // 渲染搜索结果
  const renderSearchResults = () => {
    if (!isSearching || searchResults.length === 0) {
      return null;
    }
    
    return (
      <Card style={{ marginBottom: 16 }}>
        <Title level={4}>搜索结果: {searchResults.length} 条</Title>
        <List
          itemLayout="vertical"
          dataSource={searchResults}
          renderItem={item => (
            <List.Item 
              key={item.key}
              actions={[
                <Button type="link" onClick={() => handleSearchResultClick(item)}>
                  查看文档 <RightOutlined />
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    {item.title}
                    {item.category && (
                      <Tag color="blue">{item.category}</Tag>
                    )}
                  </Space>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <Text type="secondary">
                        {item.content.substring(0, 200)}...
                      </Text>
                    </div>
                    <div>
                      <Tag icon={
                        activeTab === 'guide' ? <BookOutlined /> : 
                        activeTab === 'faq' ? <QuestionCircleOutlined /> : 
                        <ToolOutlined />
                      }>
                        {activeTab === 'guide' ? '用户指南' : 
                         activeTab === 'faq' ? '常见问题' : 
                         'API文档'}
                      </Tag>
                      {item.tags && item.tags.map((tag: string) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    );
  };

  // 渲染快速链接
  const renderQuickLinks = () => {
    const quickLinks = [
      { 
        title: '快速入门', 
        icon: <BookOutlined />, 
        description: '了解系统基本功能和流程',
        link: { tab: 'guide', key: 'getting-started' } 
      },
      { 
        title: '授权管理', 
        icon: <InfoCircleOutlined />, 
        description: '学习如何创建和管理授权',
        link: { tab: 'guide', key: 'license-management' } 
      },
      { 
        title: '设备管理', 
        icon: <ToolOutlined />, 
        description: '学习如何添加和管理设备',
        link: { tab: 'guide', key: 'device-management' } 
      },
      { 
        title: '报表与统计', 
        icon: <FileTextOutlined />, 
        description: '了解如何生成和分析报表',
        link: { tab: 'guide', key: 'reports' } 
      },
    ];
    
    return (
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 4, xl: 4, xxl: 4 }}
        dataSource={quickLinks}
        renderItem={item => (
          <List.Item>
            <Card 
              hoverable 
              onClick={() => {
                setActiveTab(item.link.tab);
                setSelectedKeys([item.link.key]);
                const doc = helpCenterData[`${item.link.tab}s`].find(d => d.key === item.link.key);
                if (doc) {
                  setCurrentDoc(doc);
                }
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <Avatar size={48} icon={item.icon} style={{ backgroundColor: '#1890ff', marginBottom: 16 }} />
                <Title level={4}>{item.title}</Title>
                <Text type="secondary">{item.description}</Text>
              </div>
            </Card>
          </List.Item>
        )}
      />
    );
  };

  // 渲染标签页内容
  const renderTabContent = () => {
    if (isSearching && searchResults.length > 0) {
      return renderSearchResults();
    }
    
    if (activeTab === 'home') {
      return (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <Title level={4}>快速链接</Title>
            {renderQuickLinks()}
          </Card>
          
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Card title="热门指南" style={{ marginBottom: 16 }}>
                <List
                  itemLayout="horizontal"
                  dataSource={helpCenterData.guides.slice(0, 5)}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<BookOutlined />}
                        title={
                          <a onClick={() => {
                            setActiveTab('guide');
                            setSelectedKeys([item.key]);
                            setCurrentDoc(item);
                          }}>{item.title}</a>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            
            <Col xs={24} md={12}>
              <Card title="常见问题" style={{ marginBottom: 16 }}>
                <List
                  itemLayout="horizontal"
                  dataSource={helpCenterData.faqs.slice(0, 5)}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<QuestionCircleOutlined />}
                        title={
                          <a onClick={() => {
                            setActiveTab('faq');
                            setSelectedKeys([item.key]);
                            setCurrentDoc(item);
                          }}>{item.title}</a>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
          
          <Card title="视频教程">
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
              dataSource={helpCenterData.videos}
              renderItem={item => (
                <List.Item>
                  <Card 
                    hoverable 
                    cover={
                      <div 
                        style={{ 
                          height: 160, 
                          background: '#f0f2f5', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          position: 'relative',
                          backgroundSize: 'cover',
                          backgroundImage: `url(${item.thumbnail})`,
                          backgroundPosition: 'center'
                        }}
                      >
                        <div 
                          style={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            width: '100%', 
                            height: '100%', 
                            background: 'rgba(0,0,0,0.3)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}
                        >
                          <VideoCameraOutlined style={{ fontSize: 48, color: '#fff' }} />
                        </div>
                      </div>
                    }
                  >
                    <Card.Meta 
                      title={item.title} 
                      description={`${item.duration} • ${item.views} 次观看`} 
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </div>
      );
    }
    
    return (
      <Row gutter={24}>
        <Col xs={24} md={6}>
          {renderTree()}
        </Col>
        <Col xs={24} md={18}>
          <Card style={{ minHeight: 600 }}>
            {renderDocContent()}
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <PageContainer 
      title="帮助中心" 
      subTitle="查找帮助文档和指南"
    >
      <div style={{ marginBottom: 24 }}>
        <Search
          placeholder="搜索帮助文档..."
          allowClear
          enterButton="搜索"
          size="large"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          style={{ maxWidth: 600 }}
        />
      </div>
      
      {isSearching && searchResults.length === 0 && searchValue && (
        <Alert
          message="未找到结果"
          description={`没有找到与 "${searchValue}" 相关的内容`}
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
      
      {renderSearchResults()}
      
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={[
          {
            key: 'home',
            label: (
              <span>
                <InfoCircleOutlined />
                首页
              </span>
            )
          },
          {
            key: 'guide',
            label: (
              <span>
                <BookOutlined />
                用户指南
              </span>
            )
          },
          {
            key: 'faq',
            label: (
              <span>
                <QuestionCircleOutlined />
                常见问题
              </span>
            )
          },
          {
            key: 'api',
            label: (
              <span>
                <ToolOutlined />
                API文档
              </span>
            )
          }
        ]}
      />
      
      {renderTabContent()}
    </PageContainer>
  );
};

export default HelpCenter;
