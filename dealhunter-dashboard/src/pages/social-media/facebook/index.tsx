import React, { useState, useEffect } from "react";
import {
  Card,
  Select,
  Input,
  Button,
  Table,
  Tag,
  Space,
  DatePicker,
  Switch,
  message,
  Tooltip,
  Alert,
  Image,
  Typography,
  Row,
  Col,
  Popconfirm,
  Modal,
  Divider,
  Steps,
  Form,
  Tabs,
} from "antd";
import {
  FacebookOutlined,
  SendOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  DeleteOutlined,
  LinkOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ScheduleOutlined,
  SaveOutlined,
  EyeOutlined,
  CheckOutlined,
  CopyOutlined,
  SettingOutlined,
  TeamOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface Deal {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  imageUrl: string;
  affiliateLink: string;
  couponCode?: string;
}

interface SocialPost {
  id: string;
  platform: string;
  dealId: string;
  deal?: Deal;
  postContent: string;
  postId?: string;
  postUrl?: string;
  imageUrl?: string;
  status: string;
  scheduledAt?: string;
  postedAt?: string;
  errorMessage?: string;
  createdAt: string;
}

interface FacebookPage {
  id: string;
  name: string;
  accessToken: string;
}

interface FacebookGroup {
  id: string;
  name: string;
}

type TargetType = "PAGE" | "GROUP";

/**
 * Facebook Tab - Full implementation for posting to Pages and Groups
 */
export const FacebookTab: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [pages, setPages] = useState<FacebookPage[]>([]);
  const [groups, setGroups] = useState<FacebookGroup[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string>("");
  const [postContent, setPostContent] = useState<string>("");
  const [includeImage, setIncludeImage] = useState<boolean>(true);
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduledTime, setScheduledTime] = useState<dayjs.Dayjs | null>(null);
  const [targetType, setTargetType] = useState<TargetType>("PAGE");
  const [selectedTarget, setSelectedTarget] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [facebookStatus, setFacebookStatus] = useState<{
    connected: boolean;
    configured: boolean;
    name?: string;
    error?: string;
  } | null>(null);

  // Preview modal state
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewPost, setPreviewPost] = useState<SocialPost | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  // Setup modal state
  const [setupVisible, setSetupVisible] = useState<boolean>(false);
  const [manualToken, setManualToken] = useState<string>("");

  // Fetch data on mount
  useEffect(() => {
    fetchFacebookStatus();
    fetchDeals();
    fetchPosts();
  }, []);

  // Fetch pages and groups when connected
  useEffect(() => {
    if (facebookStatus?.connected) {
      fetchPages();
      fetchGroups();
    }
  }, [facebookStatus?.connected]);

  const fetchFacebookStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/social-media/facebook/status`);
      const data = await response.json();
      setFacebookStatus(data);
    } catch (error) {
      console.error("Failed to fetch Facebook status:", error);
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await fetch(`${API_URL}/deals?limit=100`);
      const data = await response.json();
      setDeals(data.data || []);
    } catch (error) {
      console.error("Failed to fetch deals:", error);
      message.error("Failed to fetch deals");
    }
  };

  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const response = await fetch(`${API_URL}/social-media/posts?platform=FACEBOOK`);
      const data = await response.json();
      setPosts(data || []);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      const response = await fetch(`${API_URL}/social-media/facebook/pages`);
      const data = await response.json();
      if (data.success) {
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error("Failed to fetch pages:", error);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_URL}/social-media/facebook/groups`);
      const data = await response.json();
      if (data.success) {
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  const generatePreview = async (dealId: string) => {
    try {
      const response = await fetch(`${API_URL}/social-media/facebook/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId }),
      });
      const data = await response.json();
      setPostContent(data.content);
    } catch (error) {
      console.error("Failed to generate preview:", error);
      message.error("Failed to generate post preview");
    }
  };

  const handleDealSelect = (dealId: string) => {
    setSelectedDealId(dealId);
    if (dealId) {
      generatePreview(dealId);
    } else {
      setPostContent("");
    }
  };

  const handleSetManualToken = async () => {
    if (!manualToken.trim()) {
      message.error("Please enter an access token");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/social-media/facebook/set-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: manualToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to set token");
      }

      message.success("Access token set successfully!");
      setManualToken("");
      setSetupVisible(false);
      fetchFacebookStatus();
    } catch (error) {
      message.error("Failed to set access token");
    } finally {
      setLoading(false);
    }
  };

  // Save as draft for later approval
  const handleSaveDraft = async () => {
    if (!selectedDealId || !postContent || !selectedTarget) {
      message.error("Please select a deal, enter content, and select a target Page/Group");
      return;
    }

    const selectedPage = pages.find(p => p.id === selectedTarget);

    setLoading(true);
    try {
      const payload: any = {
        dealId: selectedDealId,
        content: postContent,
        targetType,
        targetId: selectedTarget,
        includeImage,
        saveAsDraft: true,
      };

      if (targetType === "PAGE" && selectedPage) {
        payload.pageAccessToken = selectedPage.accessToken;
      }

      if (isScheduled && scheduledTime) {
        payload.scheduledAt = scheduledTime.toISOString();
      }

      const response = await fetch(`${API_URL}/social-media/facebook/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save draft");
      }

      message.success("Draft saved! Review and approve it from the list below.");
      setSelectedDealId("");
      setPostContent("");
      setSelectedTarget("");
      setIsScheduled(false);
      setScheduledTime(null);
      fetchPosts();
    } catch (error) {
      console.error("Failed to save draft:", error);
      message.error(error instanceof Error ? error.message : "Failed to save draft");
    } finally {
      setLoading(false);
    }
  };

  // Open preview modal for approval
  const handleOpenPreview = (post: SocialPost) => {
    setPreviewPost(post);
    // Try to parse JSON content for scheduled/draft posts
    try {
      const parsed = JSON.parse(post.postContent);
      setEditingContent(parsed.content || post.postContent);
    } catch {
      setEditingContent(post.postContent);
    }
    setPreviewVisible(true);
  };

  // Approve and post/schedule
  const handleApprovePost = async () => {
    if (!previewPost) return;

    setLoading(true);
    try {
      // Update content if changed
      if (editingContent !== previewPost.postContent) {
        await fetch(`${API_URL}/social-media/posts/${previewPost.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postContent: editingContent }),
        });
      }

      // Approve the post
      const response = await fetch(`${API_URL}/social-media/posts/${previewPost.id}/approve`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve post");
      }

      const result = await response.json();
      message.success(result.scheduled ? "Post scheduled for publishing!" : "Post published successfully!");
      setPreviewVisible(false);
      setPreviewPost(null);
      fetchPosts();
    } catch (error) {
      console.error("Failed to approve post:", error);
      message.error(error instanceof Error ? error.message : "Failed to approve post");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, deleteFromFacebook: boolean = false) => {
    try {
      const response = await fetch(
        `${API_URL}/social-media/posts/${id}?deleteFromPlatform=${deleteFromFacebook}`,
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error("Failed to delete");
      message.success("Post deleted");
      fetchPosts();
    } catch (error) {
      message.error("Failed to delete post");
    }
  };

  const handleRetry = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/social-media/posts/${id}/retry`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to retry");
      message.success("Retrying post...");
      fetchPosts();
    } catch (error) {
      message.error("Failed to retry post");
    }
  };

  const selectedDeal = deals.find((d) => d.id === selectedDealId);
  const characterCount = postContent.length;

  const statusTag = (status: string) => {
    switch (status) {
      case "POSTED":
        return <Tag icon={<CheckCircleOutlined />} color="success">Posted</Tag>;
      case "SCHEDULED":
        return <Tag icon={<ScheduleOutlined />} color="processing">Scheduled</Tag>;
      case "FAILED":
        return <Tag icon={<CloseCircleOutlined />} color="error">Failed</Tag>;
      case "DRAFT":
        return <Tag icon={<EditOutlined />} color="warning">Pending Approval</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Deal",
      dataIndex: ["deal", "title"],
      key: "deal",
      width: 200,
      render: (title: string) => (
        <Text ellipsis style={{ maxWidth: 180 }}>{title || "N/A"}</Text>
      ),
    },
    {
      title: "Content",
      dataIndex: "postContent",
      key: "content",
      width: 300,
      render: (content: string) => {
        // Try to parse JSON content
        try {
          const parsed = JSON.parse(content);
          return <Text ellipsis style={{ maxWidth: 280 }}>{parsed.content || content}</Text>;
        } catch {
          return <Text ellipsis style={{ maxWidth: 280 }}>{content}</Text>;
        }
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: string) => statusTag(status),
    },
    {
      title: "Time",
      key: "time",
      width: 150,
      render: (_: any, record: SocialPost) => {
        if (record.postedAt) {
          return (
            <Tooltip title={dayjs(record.postedAt).format("YYYY-MM-DD HH:mm")}>
              <Text type="secondary">{dayjs(record.postedAt).fromNow()}</Text>
            </Tooltip>
          );
        }
        if (record.scheduledAt) {
          return (
            <Tooltip title={dayjs(record.scheduledAt).format("YYYY-MM-DD HH:mm")}>
              <Text type="warning">
                <ClockCircleOutlined /> {dayjs(record.scheduledAt).fromNow()}
              </Text>
            </Tooltip>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: any, record: SocialPost) => (
        <Space>
          {/* Preview & Approve button for drafts */}
          {record.status === "DRAFT" && (
            <Tooltip title="Preview & Approve">
              <Button
                type="primary"
                icon={<EyeOutlined />}
                onClick={() => handleOpenPreview(record)}
                size="small"
              >
                Review
              </Button>
            </Tooltip>
          )}
          {record.postUrl && (
            <Tooltip title="View on Facebook">
              <Button
                type="link"
                icon={<LinkOutlined />}
                href={record.postUrl}
                target="_blank"
                size="small"
              />
            </Tooltip>
          )}
          {record.status === "FAILED" && (
            <Tooltip title="Retry">
              <Button
                type="link"
                icon={<ReloadOutlined />}
                onClick={() => handleRetry(record.id)}
                size="small"
              />
            </Tooltip>
          )}
          <Popconfirm
            title="Delete this post?"
            description={record.postId ? "Also delete from Facebook?" : undefined}
            onConfirm={() => handleDelete(record.id, !!record.postId)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete">
              <Button type="link" danger icon={<DeleteOutlined />} size="small" />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Count drafts pending approval
  const draftsCount = posts.filter(p => p.status === "DRAFT").length;

  // Setup Guide Component
  const SetupGuide = () => (
    <Card>
      <Title level={4}>
        <SettingOutlined /> Facebook Integration Setup
      </Title>
      <Paragraph>
        To post to Facebook Pages and Groups, you need to set up a Facebook App and connect your account.
      </Paragraph>

      <Steps
        direction="vertical"
        current={facebookStatus?.configured ? (facebookStatus?.connected ? 2 : 1) : 0}
        items={[
          {
            title: "Configure Facebook App",
            description: (
              <div>
                <Paragraph>
                  1. Go to <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer">Facebook Developers</a>
                </Paragraph>
                <Paragraph>
                  2. Create a new app (Business type)
                </Paragraph>
                <Paragraph>
                  3. Add "Facebook Login" and "Pages API" products
                </Paragraph>
                <Paragraph>
                  4. Copy App ID and App Secret to your server environment variables:
                  <pre style={{ background: "#f5f5f5", padding: 8, borderRadius: 4, marginTop: 8 }}>
{`FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret`}
                  </pre>
                </Paragraph>
              </div>
            ),
          },
          {
            title: "Connect Your Account",
            description: (
              <div>
                <Paragraph>
                  Get a User Access Token with the required permissions:
                </Paragraph>
                <ul>
                  <li>pages_manage_posts</li>
                  <li>pages_read_engagement</li>
                  <li>publish_to_groups</li>
                </ul>
                <Paragraph>
                  You can use the <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer">Graph API Explorer</a> to generate a token.
                </Paragraph>
                <Button
                  type="primary"
                  onClick={() => setSetupVisible(true)}
                  disabled={!facebookStatus?.configured}
                >
                  Set Access Token
                </Button>
              </div>
            ),
          },
          {
            title: "Start Posting",
            description: "Once connected, you can post to your Pages and Groups!",
          },
        ]}
      />
    </Card>
  );

  // If not connected, show setup guide
  if (!facebookStatus?.connected) {
    return (
      <div>
        {/* Status Alert */}
        <Alert
          message={
            !facebookStatus?.configured
              ? "Facebook App not configured"
              : "Facebook not connected"
          }
          description={
            !facebookStatus?.configured
              ? "Set up your Facebook App credentials to enable posting."
              : "Connect your Facebook account to start posting."
          }
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <SetupGuide />

        {/* Manual Token Modal */}
        <Modal
          title="Set Facebook Access Token"
          open={setupVisible}
          onCancel={() => setSetupVisible(false)}
          footer={null}
        >
          <Paragraph>
            Enter a valid Facebook User Access Token with the required permissions.
          </Paragraph>
          <TextArea
            rows={4}
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="Paste your access token here..."
          />
          <div style={{ marginTop: 16, textAlign: "right" }}>
            <Button onClick={() => setSetupVisible(false)} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleSetManualToken} loading={loading}>
              Save Token
            </Button>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div>
      {/* Facebook Connection Status */}
      <Alert
        message={`Connected to Facebook as ${facebookStatus.name}`}
        type="success"
        showIcon
        style={{ marginBottom: 16 }}
        action={
          <Button size="small" onClick={() => setSetupVisible(true)}>
            Update Token
          </Button>
        }
      />

      {/* Pending Approvals Alert */}
      {draftsCount > 0 && (
        <Alert
          message={`${draftsCount} post${draftsCount > 1 ? 's' : ''} pending approval`}
          description="Review and approve posts in the table below before they go live."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Post Composer */}
      <Card title="Create New Facebook Post" style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          {/* Left: Image Preview */}
          <Col span={8}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Deal Image Preview</Text>
            </div>
            {selectedDeal?.imageUrl ? (
              <Image
                src={selectedDeal.imageUrl}
                alt="Deal image"
                style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
              />
            ) : (
              <div
                style={{
                  height: 200,
                  background: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                }}
              >
                <Text type="secondary">Select a deal to preview image</Text>
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <Switch
                checked={includeImage}
                onChange={setIncludeImage}
                disabled={!selectedDeal?.imageUrl}
              />
              <Text style={{ marginLeft: 8 }}>Include Image</Text>
            </div>
          </Col>

          {/* Right: Post Content */}
          <Col span={16}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Select Deal</Text>
              <Select
                placeholder="Select a deal to post about"
                style={{ width: "100%", marginTop: 8 }}
                value={selectedDealId || undefined}
                onChange={handleDealSelect}
                showSearch
                optionFilterProp="children"
                allowClear
              >
                {deals.map((deal) => (
                  <Select.Option key={deal.id} value={deal.id}>
                    {deal.title} - ${deal.price} ({Math.round(deal.discountPercentage)}% off)
                  </Select.Option>
                ))}
              </Select>
            </div>

            {/* Target Selection */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>Post To</Text>
              <div style={{ marginTop: 8 }}>
                <Tabs
                  activeKey={targetType}
                  onChange={(key) => {
                    setTargetType(key as TargetType);
                    setSelectedTarget("");
                  }}
                  items={[
                    {
                      key: "PAGE",
                      label: (
                        <span>
                          <FileTextOutlined /> Page
                        </span>
                      ),
                      children: (
                        <Select
                          placeholder="Select a Page"
                          style={{ width: "100%" }}
                          value={selectedTarget || undefined}
                          onChange={setSelectedTarget}
                          allowClear
                        >
                          {pages.map((page) => (
                            <Select.Option key={page.id} value={page.id}>
                              {page.name}
                            </Select.Option>
                          ))}
                        </Select>
                      ),
                    },
                    {
                      key: "GROUP",
                      label: (
                        <span>
                          <TeamOutlined /> Group
                        </span>
                      ),
                      children: (
                        <Select
                          placeholder="Select a Group"
                          style={{ width: "100%" }}
                          value={selectedTarget || undefined}
                          onChange={setSelectedTarget}
                          allowClear
                        >
                          {groups.map((group) => (
                            <Select.Option key={group.id} value={group.id}>
                              {group.name}
                            </Select.Option>
                          ))}
                        </Select>
                      ),
                    },
                  ]}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <Text strong>Post Content (editable)</Text>
                <Text type="secondary">{characterCount} characters</Text>
              </div>
              <TextArea
                rows={8}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Select a deal to generate post content..."
              />
            </div>

            {/* Schedule Options */}
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Switch checked={isScheduled} onChange={setIsScheduled} />
                <Text>Schedule for later</Text>
              </Space>
              {isScheduled && (
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  value={scheduledTime}
                  onChange={setScheduledTime}
                  style={{ marginLeft: 16 }}
                  disabledDate={(current) => current && current < dayjs().startOf("day")}
                />
              )}
            </div>

            {/* Action Buttons */}
            <Space>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSaveDraft}
                loading={loading}
                disabled={!selectedDealId || !postContent || !selectedTarget}
                size="large"
              >
                Save for Review
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(postContent);
                  message.success("Post copied to clipboard!");
                }}
                disabled={!postContent}
                size="large"
              >
                Copy Post
              </Button>
              {postContent && (
                <Button onClick={() => setPostContent("")}>Clear</Button>
              )}
            </Space>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Posts will be saved as drafts. Review and approve them below before publishing.
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Post History */}
      <Card
        title="Facebook Posts Queue"
        extra={
          <Button icon={<ReloadOutlined />} onClick={fetchPosts}>
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={posts}
          rowKey="id"
          loading={postsLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* Preview & Approve Modal */}
      <Modal
        title="Review Facebook Post Before Publishing"
        open={previewVisible}
        onCancel={() => {
          setPreviewVisible(false);
          setPreviewPost(null);
        }}
        footer={null}
        width={700}
      >
        {previewPost && (
          <div>
            {/* Post Preview Card */}
            <Card
              style={{
                background: "#f0f2f5",
                borderRadius: 16,
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: "#1877F2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <FacebookOutlined style={{ color: "white", fontSize: 24 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{facebookStatus?.name || "Your Page/Group"}</div>
                  <div style={{ color: "#65676b", fontSize: 14 }}>
                    {previewPost.scheduledAt
                      ? `Scheduled for ${dayjs(previewPost.scheduledAt).format("MMM D, YYYY h:mm A")}`
                      : "Will post immediately"}
                  </div>
                </div>
              </div>

              <Divider style={{ margin: "16px 0" }} />

              {/* Editable Content */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text strong>Edit Post Content</Text>
                  <Text type="secondary">{editingContent.length} characters</Text>
                </div>
                <TextArea
                  rows={6}
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                />
              </div>

              {/* Image Preview */}
              {previewPost.imageUrl && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Attached Image:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Image
                      src={previewPost.imageUrl}
                      alt="Post image"
                      style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 12 }}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Deal Info */}
            {previewPost.deal && (
              <Card size="small" style={{ marginBottom: 24 }}>
                <Text strong>Deal: </Text>
                <Text>{previewPost.deal.title}</Text>
                <br />
                <Text strong>Price: </Text>
                <Text>${previewPost.deal.price} (was ${previewPost.deal.originalPrice})</Text>
                <br />
                <Text strong>Discount: </Text>
                <Text>{Math.round(previewPost.deal.discountPercentage)}% off</Text>
              </Card>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <Button
                onClick={() => {
                  setPreviewVisible(false);
                  setPreviewPost(null);
                }}
              >
                Cancel
              </Button>
              <Popconfirm
                title="Delete this draft?"
                onConfirm={() => {
                  handleDelete(previewPost.id, false);
                  setPreviewVisible(false);
                  setPreviewPost(null);
                }}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />}>
                  Delete Draft
                </Button>
              </Popconfirm>
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(editingContent);
                  message.success("Post copied to clipboard!");
                }}
              >
                Copy Post
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleApprovePost}
                loading={loading}
                disabled={editingContent.length === 0}
              >
                {previewPost.scheduledAt ? "Approve & Schedule" : "Approve & Post Now"}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Token Modal */}
      <Modal
        title="Update Facebook Access Token"
        open={setupVisible}
        onCancel={() => setSetupVisible(false)}
        footer={null}
      >
        <Paragraph>
          Enter a valid Facebook User Access Token with the required permissions.
        </Paragraph>
        <TextArea
          rows={4}
          value={manualToken}
          onChange={(e) => setManualToken(e.target.value)}
          placeholder="Paste your access token here..."
        />
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Button onClick={() => setSetupVisible(false)} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSetManualToken} loading={loading}>
            Save Token
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default FacebookTab;
