import React from "react";
import { Tabs } from "antd";
import { TwitterOutlined, FacebookOutlined, InstagramOutlined } from "@ant-design/icons";
import { TwitterTab } from "./twitter";
import { FacebookTab } from "./facebook";
import { InstagramTab } from "./instagram";
import { TikTokTab } from "./tiktok";

// TikTok icon (not available in antd)
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
  </svg>
);

/**
 * Social Media Page - Main page for social media management
 *
 * Contains tabs for:
 * - Twitter/X
 * - Facebook (placeholder)
 * - Instagram (placeholder)
 * - TikTok (placeholder)
 */
export const SocialMediaPage: React.FC = () => {
  const items = [
    {
      key: "twitter",
      label: (
        <span>
          <TwitterOutlined /> Twitter / X
        </span>
      ),
      children: <TwitterTab />,
    },
    {
      key: "facebook",
      label: (
        <span>
          <FacebookOutlined /> Facebook
        </span>
      ),
      children: <FacebookTab />,
    },
    {
      key: "instagram",
      label: (
        <span>
          <InstagramOutlined /> Instagram
        </span>
      ),
      children: <InstagramTab />,
    },
    {
      key: "tiktok",
      label: (
        <span>
          <TikTokIcon /> TikTok
        </span>
      ),
      children: <TikTokTab />,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px" }}>Social Media Management</h1>
      <Tabs defaultActiveKey="twitter" items={items} size="large" />
    </div>
  );
};

export default SocialMediaPage;
