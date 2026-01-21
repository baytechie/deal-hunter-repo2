import React from "react";
import { Card, Row, Col, Statistic, Typography, Button, Alert, Divider } from "antd";
import {
  LineChartOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  EyeOutlined,
  RiseOutlined,
  ExportOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

/**
 * Analytics Page - Google Analytics 4 Dashboard
 *
 * Provides quick access to GA4 reports and displays key metrics.
 * The embedded iframe shows real-time GA4 data.
 */
export const AnalyticsPage: React.FC = () => {
  const GA4_PROPERTY_ID = "458aborr463"; // Your GA4 Property ID (from G-M7MNFG4WYC)
  const GA4_MEASUREMENT_ID = "G-M7MNFG4WYC";

  // Direct links to GA4 reports
  const ga4Links = {
    realtime: `https://analytics.google.com/analytics/web/#/p${GA4_PROPERTY_ID}/realtime/overview`,
    overview: `https://analytics.google.com/analytics/web/#/p${GA4_PROPERTY_ID}/reports/reportinghub`,
    acquisition: `https://analytics.google.com/analytics/web/#/p${GA4_PROPERTY_ID}/reports/acquisition-overview`,
    engagement: `https://analytics.google.com/analytics/web/#/p${GA4_PROPERTY_ID}/reports/engagement-overview`,
    events: `https://analytics.google.com/analytics/web/#/p${GA4_PROPERTY_ID}/reports/explorer?params=_u..nav%3Dmaui`,
    home: `https://analytics.google.com/analytics/web/`,
  };

  const openGA4Report = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>
        <LineChartOutlined /> Analytics Dashboard
      </Title>

      <Alert
        message="Google Analytics 4 Connected"
        description={
          <span>
            Measurement ID: <Text code>{GA4_MEASUREMENT_ID}</Text> - Tracking is active on DealHunter PWA
          </span>
        }
        type="success"
        showIcon
        style={{ marginBottom: "24px" }}
      />

      {/* Quick Stats Cards */}
      <Title level={4}>Quick Access</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => openGA4Report(ga4Links.realtime)}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <Statistic
              title="Real-Time"
              value="Live"
              prefix={<UserOutlined style={{ color: "#52c41a" }} />}
              valueStyle={{ color: "#52c41a" }}
            />
            <Text type="secondary">Active users now</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => openGA4Report(ga4Links.overview)}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <Statistic
              title="Overview"
              value="Reports"
              prefix={<EyeOutlined style={{ color: "#1890ff" }} />}
              valueStyle={{ color: "#1890ff" }}
            />
            <Text type="secondary">All metrics</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => openGA4Report(ga4Links.acquisition)}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <Statistic
              title="Acquisition"
              value="Traffic"
              prefix={<RiseOutlined style={{ color: "#722ed1" }} />}
              valueStyle={{ color: "#722ed1" }}
            />
            <Text type="secondary">Where users come from</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            onClick={() => openGA4Report(ga4Links.events)}
            style={{ textAlign: "center", cursor: "pointer" }}
          >
            <Statistic
              title="Events"
              value="Actions"
              prefix={<ShoppingCartOutlined style={{ color: "#fa8c16" }} />}
              valueStyle={{ color: "#fa8c16" }}
            />
            <Text type="secondary">Buy clicks, saves, shares</Text>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Tracked Events Info */}
      <Title level={4}>Tracked Events</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} md={12}>
          <Card title="User Actions" size="small">
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              <li><Text strong>buy_click</Text> - When user clicks View Deal/Buy button</li>
              <li><Text strong>save_deal</Text> - When user saves a deal</li>
              <li><Text strong>unsave_deal</Text> - When user removes a saved deal</li>
              <li><Text strong>share_deal</Text> - When user shares a deal</li>
              <li><Text strong>copy_coupon</Text> - When user copies a coupon code</li>
            </ul>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Navigation & Search" size="small">
            <ul style={{ paddingLeft: "20px", margin: 0 }}>
              <li><Text strong>page_view</Text> - Screen/page navigation</li>
              <li><Text strong>view_deal</Text> - When user views deal details</li>
              <li><Text strong>search</Text> - Search queries</li>
              <li><Text strong>filter_category</Text> - Category filter usage</li>
              <li><Text strong>login / sign_up</Text> - Authentication events</li>
            </ul>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Open Full Analytics Button */}
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>Full Analytics Dashboard</Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              Open Google Analytics 4 for detailed reports, custom dashboards, and data exploration.
            </Paragraph>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<ExportOutlined />}
              onClick={() => openGA4Report(ga4Links.home)}
            >
              Open Google Analytics
            </Button>
          </Col>
        </Row>
      </Card>

      <Divider />

      {/* Embedded GA4 Report */}
      <Title level={4}>Embedded Report</Title>
      <Card>
        <Alert
          message="Note"
          description="The embedded report below requires you to be signed in to Google Analytics in the same browser. If you see a blank frame, click 'Open Google Analytics' above to sign in first."
          type="info"
          showIcon
          style={{ marginBottom: "16px" }}
        />
        <div
          style={{
            width: "100%",
            height: "600px",
            border: "1px solid #d9d9d9",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <iframe
            src={`https://analytics.google.com/analytics/web/#/p${GA4_PROPERTY_ID}/reports/reportinghub`}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
            }}
            title="Google Analytics Dashboard"
          />
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
