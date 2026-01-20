import React from "react";
import { Result, Button } from "antd";
import { FacebookOutlined } from "@ant-design/icons";

/**
 * Facebook Tab - Placeholder for future implementation
 */
export const FacebookTab: React.FC = () => {
  return (
    <Result
      icon={<FacebookOutlined style={{ color: "#1877F2", fontSize: 64 }} />}
      title="Facebook Integration"
      subTitle="Facebook posting will be available in a future update. Stay tuned!"
      extra={
        <Button type="primary" disabled>
          Coming Soon
        </Button>
      }
    />
  );
};

export default FacebookTab;
