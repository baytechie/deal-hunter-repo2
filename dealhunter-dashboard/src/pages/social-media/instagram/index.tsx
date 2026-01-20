import React from "react";
import { Result, Button } from "antd";
import { InstagramOutlined } from "@ant-design/icons";

/**
 * Instagram Tab - Placeholder for future implementation
 */
export const InstagramTab: React.FC = () => {
  return (
    <Result
      icon={<InstagramOutlined style={{ color: "#E4405F", fontSize: 64 }} />}
      title="Instagram Integration"
      subTitle="Instagram posting will be available in a future update. Stay tuned!"
      extra={
        <Button type="primary" disabled>
          Coming Soon
        </Button>
      }
    />
  );
};

export default InstagramTab;
