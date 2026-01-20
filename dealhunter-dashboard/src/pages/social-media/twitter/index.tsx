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
} from "antd";
import {
  TwitterOutlined,
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
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { TextArea } = Input;
const { Text, Title } = Typography;

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

/**
 * Twitter Tab - Tweet composer with preview/approval workflow
 */
export const TwitterTab: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [selectedDealId, setSelectedDealId] = useState<string>("");
  const [tweetContent, setTweetContent] = useState<string>("");
  const [includeImage, setIncludeImage] = useState<boolean>(true);
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduledTime, setScheduledTime] = useState<dayjs.Dayjs | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [postsLoading, setPostsLoading] = useState<boolean>(false);
  const [twitterStatus, setTwitterStatus] = useState<{
    connected: boolean;
    username?: string;
  } | null>(null);

  // Preview modal state
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [previewPost, setPreviewPost] = useState<SocialPost | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");

  // Fetch deals, posts, and Twitter status on mount
  useEffect(() => {
    fetchDeals();
    fetchPosts();
    fetchTwitterStatus();
  }, []);

  const fetchTwitterStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/social-media/twitter/status`);
      const data = await response.json();
      setTwitterStatus(data);
    } catch (error) {
      console.error("Failed to fetch Twitter status:", error);
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
      const response = await fetch(`${API_URL}/social-media/posts?platform=TWITTER`);
      const data = await response.json();
      setPosts(data || []);
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const generatePreview = async (dealId: string) => {
    try {
      const response = await fetch(`${API_URL}/social-media/twitter/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId }),
      });
      const data = await response.json();
      setTweetContent(data.content);
    } catch (error) {
      console.error("Failed to generate preview:", error);
      message.error("Failed to generate tweet preview");
    }
  };

  const handleDealSelect = (dealId: string) => {
    setSelectedDealId(dealId);
    if (dealId) {
      generatePreview(dealId);
    } else {
      setTweetContent("");
    }
  };

  // Save as draft for later approval
  const handleSaveDraft = async () => {
    if (!selectedDealId || !tweetContent) {
      message.error("Please select a deal and enter tweet content");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        dealId: selectedDealId,
        content: tweetContent,
        includeImage,
        saveAsDraft: true,
      };

      if (isScheduled && scheduledTime) {
        payload.scheduledAt = scheduledTime.toISOString();
      }

      const response = await fetch(`${API_URL}/social-media/twitter/post`, {
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
      setTweetContent("");
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
    setEditingContent(post.postContent);
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

  const handleDelete = async (id: string, deleteFromTwitter: boolean = false) => {
    try {
      const response = await fetch(
        `${API_URL}/social-media/posts/${id}?deleteFromPlatform=${deleteFromTwitter}`,
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
  const characterCount = tweetContent.length;
  const isOverLimit = characterCount > 280;

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
      title: "Tweet Content",
      dataIndex: "postContent",
      key: "content",
      width: 300,
      render: (content: string) => (
        <Text ellipsis style={{ maxWidth: 280 }}>{content}</Text>
      ),
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
            <Tooltip title="View on Twitter">
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
            description={record.postId ? "Also delete from Twitter?" : undefined}
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

  return (
    <div>
      {/* Twitter Connection Status */}
      {twitterStatus && (
        <Alert
          message={
            twitterStatus.connected
              ? `Connected to Twitter as @${twitterStatus.username}`
              : "Twitter not connected"
          }
          type={twitterStatus.connected ? "success" : "warning"}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

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

      {/* Tweet Composer */}
      <Card title="Create New Tweet" style={{ marginBottom: 24 }}>
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

          {/* Right: Tweet Content */}
          <Col span={16}>
            <div style={{ marginBottom: 16 }}>
              <Text strong>Select Deal</Text>
              <Select
                placeholder="Select a deal to tweet about"
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

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <Text strong>Tweet Content (editable)</Text>
                <Text type={isOverLimit ? "danger" : "secondary"}>
                  {characterCount}/280
                </Text>
              </div>
              <TextArea
                rows={8}
                value={tweetContent}
                onChange={(e) => setTweetContent(e.target.value)}
                placeholder="Select a deal to generate tweet content..."
                status={isOverLimit ? "error" : undefined}
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
                disabled={!selectedDealId || !tweetContent || isOverLimit}
                size="large"
              >
                Save for Review
              </Button>
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(tweetContent);
                  message.success("Tweet copied to clipboard! Open Twitter to post manually.");
                }}
                disabled={!tweetContent}
                size="large"
              >
                Copy Tweet
              </Button>
              {tweetContent && (
                <Button onClick={() => setTweetContent("")}>Clear</Button>
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
        title="Posts Queue"
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
        title="Review Tweet Before Publishing"
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
            {/* Tweet Preview Card */}
            <Card
              style={{
                background: "#f7f9fa",
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
                    background: "#1DA1F2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <TwitterOutlined style={{ color: "white", fontSize: 24 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    @{twitterStatus?.username || "YourAccount"}
                  </div>
                  <div style={{ color: "#536471", fontSize: 14 }}>
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
                  <Text strong>Edit Tweet Content</Text>
                  <Text type={editingContent.length > 280 ? "danger" : "secondary"}>
                    {editingContent.length}/280
                  </Text>
                </div>
                <TextArea
                  rows={6}
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  status={editingContent.length > 280 ? "error" : undefined}
                />
              </div>

              {/* Image Preview */}
              {previewPost.imageUrl && (
                <div style={{ marginTop: 16 }}>
                  <Text strong>Attached Image:</Text>
                  <div style={{ marginTop: 8 }}>
                    <Image
                      src={previewPost.imageUrl}
                      alt="Tweet image"
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
                  message.success("Tweet copied to clipboard!");
                }}
              >
                Copy Tweet
              </Button>
              <Button
                icon={<TwitterOutlined />}
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(editingContent)}`}
                target="_blank"
              >
                Open Twitter
              </Button>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={handleApprovePost}
                loading={loading}
                disabled={editingContent.length > 280 || editingContent.length === 0}
              >
                {previewPost.scheduledAt ? "Approve & Schedule" : "Approve & Post Now"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TwitterTab;
