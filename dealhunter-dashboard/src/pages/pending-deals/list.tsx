import {
  List,
  useTable,
  ImageField,
} from "@refinedev/antd";
import { Table, Space, Button, Tag, Modal, Input, Checkbox, Form, Select, Slider, InputNumber, message } from "antd";
import { CheckOutlined, CloseOutlined, SyncOutlined } from "@ant-design/icons";
import { useState } from "react";

// Hardcoded API URL for production
const API_URL = "https://api.huntdeals.app";

const getToken = () => localStorage.getItem("refine-auth");

interface ApprovalFormData {
  customTitle: string;
  couponCode: string;
  promoDescription: string;
  isHot: boolean;
  isFeatured: boolean;
}

interface SyncConfigData {
  keywords: string;
  category: string;
  itemCount: number;
  minDiscountPercent: number;
}

export const PendingDealList = () => {
  const [syncing, setSyncing] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [selectedDealForApproval, setSelectedDealForApproval] = useState<any>(null);
  const [approvalForm, setApprovalForm] = useState<ApprovalFormData>({
    customTitle: "",
    couponCode: "",
    promoDescription: "",
    isHot: false,
    isFeatured: false,
  });
  const [syncModalVisible, setSyncModalVisible] = useState(false);
  const [syncConfig, setSyncConfig] = useState<SyncConfigData>({
    keywords: "deals discounts sale",
    category: "Electronics",
    itemCount: 50,
    minDiscountPercent: 15,
  });

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

  // Open sync configuration modal
  const openSyncModal = () => {
    setSyncModalVisible(true);
  };

  // Sync deals from Amazon with configured parameters
  const handleSync = async () => {
    setSyncing(true);
    setSyncModalVisible(false);
    try {
      const response = await fetch(`${API_URL}/pending-deals/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          keywords: syncConfig.keywords,
          category: syncConfig.category,
          itemCount: syncConfig.itemCount,
          minDiscountPercent: syncConfig.minDiscountPercent,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Sync failed");
      }

      const result = await response.json();
      message.success(`Synced: ${result.created} new deals, ${result.skipped} skipped (fetched ${result.total})`);
      window.location.reload();
    } catch (error: any) {
      console.error("Sync error:", error);
      message.error(error.message || "Failed to sync deals");
    }
    setSyncing(false);
  };

  // Open approve modal
  const openApproveModal = (record: any) => {
    setSelectedDealForApproval(record);
    // Pre-populate promo description from Amazon deal info
    let promoDesc = "";
    if (record.dealBadge) {
      promoDesc = record.dealBadge;
      if (record.dealEndTime) {
        const endDate = new Date(record.dealEndTime);
        promoDesc += ` - Ends ${endDate.toLocaleDateString()}`;
      }
    }
    setApprovalForm({
      customTitle: "",
      couponCode: record.couponCode || "",
      promoDescription: promoDesc,
      isHot: !!record.dealBadge, // Auto-mark as hot if Amazon deal
      isFeatured: false,
    });
    setApproveModalVisible(true);
  };

  // Submit approval
  const handleApprove = async () => {
    if (!selectedDealForApproval) return;

    try {
      const token = getToken();
      const id = selectedDealForApproval.id;
      console.log("Approving deal:", id, "Token:", token ? "present" : "missing");

      const response = await fetch(`${API_URL}/pending-deals/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customTitle: approvalForm.customTitle || undefined,
          couponCode: approvalForm.couponCode || undefined,
          promoDescription: approvalForm.promoDescription || undefined,
          isHot: approvalForm.isHot,
          isFeatured: approvalForm.isFeatured,
        }),
      });

      console.log("Approve response status:", response.status);

      if (response.ok) {
        message.success("Deal approved and published!");
        setApproveModalVisible(false);
        setSelectedDealForApproval(null);
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
            onClick={openSyncModal}
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
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} deals`,
          pageSizeOptions: ["10", "20", "50"],
        }}
      >
        <Table.Column
          dataIndex="imageUrl"
          title="Image"
          render={(value, record: any) => (
            <ImageField value={value} width={60} style={{ borderRadius: 4 }} alt={record.title || "Deal image"} />
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
            <Tag color="red">{parseFloat(value)?.toFixed(0)}% OFF</Tag>
          )}
        />
        <Table.Column dataIndex="category" title="Category" />
        <Table.Column
          dataIndex="dealBadge"
          title="Deal Type"
          render={(value) => value ? (
            <Tag color="purple">{value}</Tag>
          ) : (
            <span style={{ color: "#999" }}>-</span>
          )}
        />
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
                onClick={() => openApproveModal(record)}
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
          aria-label="Rejection reason"
        />
      </Modal>

      <Modal
        title="Approve Deal"
        open={approveModalVisible}
        onOk={handleApprove}
        onCancel={() => {
          setApproveModalVisible(false);
          setSelectedDealForApproval(null);
        }}
        okText="Approve & Publish"
        width={600}
      >
        {selectedDealForApproval && (
          <Form layout="vertical">
            <Form.Item label="Original Title">
              <div style={{ padding: "8px", background: "#f5f5f5", borderRadius: "4px" }}>
                {selectedDealForApproval.title}
              </div>
            </Form.Item>

            {/* Amazon Deal Info */}
            {selectedDealForApproval.dealBadge && (
              <Form.Item label="Amazon Deal Info">
                <div style={{ padding: "8px", background: "#f0e6ff", borderRadius: "4px", border: "1px solid #d3adf7" }}>
                  <Tag color="purple">{selectedDealForApproval.dealBadge}</Tag>
                  {selectedDealForApproval.dealAccessType && (
                    <Tag color="blue">{selectedDealForApproval.dealAccessType}</Tag>
                  )}
                  {selectedDealForApproval.dealEndTime && (
                    <span style={{ marginLeft: 8, color: "#666" }}>
                      Ends: {new Date(selectedDealForApproval.dealEndTime).toLocaleString()}
                    </span>
                  )}
                </div>
              </Form.Item>
            )}

            <Form.Item label="Custom Title (optional)">
              <Input
                placeholder="Leave empty to use original title"
                value={approvalForm.customTitle}
                onChange={(e) => setApprovalForm({ ...approvalForm, customTitle: e.target.value })}
                aria-label="Custom title for deal"
              />
            </Form.Item>

            <Form.Item label="Promo Code (optional)">
              <Input
                placeholder="e.g., 8B67WSYJ"
                value={approvalForm.couponCode}
                onChange={(e) => setApprovalForm({ ...approvalForm, couponCode: e.target.value })}
                style={{ fontFamily: "monospace" }}
                aria-label="Promo code for deal"
              />
            </Form.Item>

            <Form.Item label="Promo Description (optional)">
              <Input.TextArea
                placeholder="e.g., Save 32% with code 8B67WSYJ, through 2/18"
                value={approvalForm.promoDescription}
                onChange={(e) => setApprovalForm({ ...approvalForm, promoDescription: e.target.value })}
                rows={2}
                aria-label="Promo description for deal"
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Checkbox
                  checked={approvalForm.isHot}
                  onChange={(e) => setApprovalForm({ ...approvalForm, isHot: e.target.checked })}
                >
                  Mark as HOT 🔥
                </Checkbox>
                <Checkbox
                  checked={approvalForm.isFeatured}
                  onChange={(e) => setApprovalForm({ ...approvalForm, isFeatured: e.target.checked })}
                >
                  Featured Deal ⭐
                </Checkbox>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <Modal
        title="Sync from Amazon"
        open={syncModalVisible}
        onOk={handleSync}
        onCancel={() => setSyncModalVisible(false)}
        okText="Start Sync"
        width={500}
      >
        <Form layout="vertical">
          <Form.Item label="Search Keywords">
            <Input
              placeholder="e.g., deals discounts sale"
              value={syncConfig.keywords}
              onChange={(e) => setSyncConfig({ ...syncConfig, keywords: e.target.value })}
              aria-label="Search keywords for Amazon sync"
            />
          </Form.Item>

          <Form.Item label="Category">
            <Select
              value={syncConfig.category}
              onChange={(value) => setSyncConfig({ ...syncConfig, category: value })}
              style={{ width: "100%" }}
            >
              <Select.Option value="Electronics">Electronics</Select.Option>
              <Select.Option value="Home & Kitchen">Home & Kitchen</Select.Option>
              <Select.Option value="Fashion">Fashion</Select.Option>
              <Select.Option value="Beauty">Beauty</Select.Option>
              <Select.Option value="Sports">Sports</Select.Option>
              <Select.Option value="Books">Books</Select.Option>
              <Select.Option value="Toys">Toys</Select.Option>
              <Select.Option value="Health">Health</Select.Option>
              <Select.Option value="Automotive">Automotive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label={`Number of Deals to Fetch: ${syncConfig.itemCount}`}>
            <Slider
              min={10}
              max={100}
              step={10}
              value={syncConfig.itemCount}
              onChange={(value) => setSyncConfig({ ...syncConfig, itemCount: value })}
              marks={{
                10: "10",
                50: "50",
                100: "100",
              }}
            />
            <div style={{ color: "#888", fontSize: "12px", marginTop: "4px" }}>
              Amazon allows up to 100 items (10 pages x 10 items per page)
            </div>
          </Form.Item>

          <Form.Item label="Minimum Discount %">
            <InputNumber
              min={0}
              max={99}
              value={syncConfig.minDiscountPercent}
              onChange={(value) => setSyncConfig({ ...syncConfig, minDiscountPercent: value || 0 })}
              style={{ width: "100%" }}
              addonAfter="%"
            />
          </Form.Item>
        </Form>
      </Modal>
    </List>
  );
};
