import {
  List,
  useTable,
  ImageField,
} from "@refinedev/antd";
import { Table, Space, Button, Tag, Modal, Input, message } from "antd";
import { CheckOutlined, CloseOutlined, SyncOutlined } from "@ant-design/icons";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getToken = () => localStorage.getItem("refine-auth");

export const PendingDealList = () => {
  const [syncing, setSyncing] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  const { tableProps } = useTable({
    resource: "pending-deals",
    pagination: {
      pageSize: 10,
    },
    syncWithLocation: true,
  });

  // Extract state from tableProps
  const isLoading = tableProps?.loading ?? false;
  const dataSource = tableProps?.dataSource ?? [];

  // Sync deals from Amazon
  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(`${API_URL}/pending-deals/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          keywords: "deals discounts sale",
          category: "Electronics",
          itemCount: 10,
          minDiscountPercent: 15,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Sync failed");
      }

      const result = await response.json();
      message.success(`Synced: ${result.created} new deals, ${result.skipped} skipped`);
      window.location.reload();
    } catch (error: any) {
      console.error("Sync error:", error);
      message.error(error.message || "Failed to sync deals");
    }
    setSyncing(false);
  };

  // Approve a deal
  const handleApprove = async (id: string) => {
    try {
      const token = getToken();
      console.log("Approving deal:", id, "Token:", token ? "present" : "missing");

      const response = await fetch(`${API_URL}/pending-deals/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isHot: false, isFeatured: false }),
      });

      console.log("Approve response status:", response.status);

      if (response.ok) {
        message.success("Deal approved and published!");
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Approve error:", errorData);
        message.error(errorData.message || "Failed to approve deal");
      }
    } catch (error: any) {
      console.error("Approve exception:", error);
      message.error(error.message || "Failed to approve deal");
    }
  };

  // Reject a deal
  const handleReject = async () => {
    if (!selectedDealId || !rejectReason) {
      message.warning("Please enter a rejection reason");
      return;
    }

    try {
      const token = getToken();
      console.log("Rejecting deal:", selectedDealId);

      const response = await fetch(`${API_URL}/pending-deals/${selectedDealId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      console.log("Reject response status:", response.status);

      if (response.ok) {
        message.success("Deal rejected");
        window.location.reload();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Reject error:", errorData);
        message.error(errorData.message || "Failed to reject deal");
      }
    } catch (error: any) {
      console.error("Reject exception:", error);
      message.error(error.message || "Failed to reject deal");
    }

    setRejectModalVisible(false);
    setRejectReason("");
    setSelectedDealId(null);
  };

  const openRejectModal = (id: string) => {
    setSelectedDealId(id);
    setRejectModalVisible(true);
  };

  return (
    <List
      title="Pending Deals"
      headerButtons={
        <Space>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
          <Button
            type="primary"
            icon={<SyncOutlined spin={syncing} />}
            onClick={handleSync}
            loading={syncing}
          >
            Sync from Amazon
          </Button>
        </Space>
      }
    >
      <Table
        {...tableProps}
        dataSource={dataSource}
        rowKey="id"
        loading={isLoading}
      >
        <Table.Column
          dataIndex="imageUrl"
          title="Image"
          render={(value) => (
            <ImageField value={value} width={60} style={{ borderRadius: 4 }} />
          )}
        />
        <Table.Column
          dataIndex="title"
          title="Title"
          render={(value) => (
            <span style={{ maxWidth: 300, display: "block" }}>
              {value?.substring(0, 60)}...
            </span>
          )}
        />
        <Table.Column
          dataIndex="price"
          title="Price"
          render={(value, record: any) => (
            <Space direction="vertical" size={0}>
              <span style={{ fontWeight: "bold", color: "#52c41a" }}>
                ${value}
              </span>
              <span style={{ textDecoration: "line-through", color: "#999" }}>
                ${record.originalPrice}
              </span>
            </Space>
          )}
        />
        <Table.Column
          dataIndex="discountPercentage"
          title="Discount"
          render={(value) => (
            <Tag color="red">{value?.toFixed(0)}% OFF</Tag>
          )}
        />
        <Table.Column dataIndex="category" title="Category" />
        <Table.Column
          dataIndex="status"
          title="Status"
          render={(value) => (
            <Tag
              color={
                value === "PENDING"
                  ? "orange"
                  : value === "APPROVED"
                  ? "green"
                  : "red"
              }
            >
              {value}
            </Tag>
          )}
        />
        <Table.Column
          title="Actions"
          render={(_, record: any) => (
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                disabled={record.status !== "PENDING"}
              >
                Approve
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => openRejectModal(record.id)}
                disabled={record.status !== "PENDING"}
              >
                Reject
              </Button>
            </Space>
          )}
        />
      </Table>

      <Modal
        title="Reject Deal"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="Reject"
        okButtonProps={{ danger: true }}
      >
        <Input.TextArea
          placeholder="Enter rejection reason..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={3}
        />
      </Modal>
    </List>
  );
};
