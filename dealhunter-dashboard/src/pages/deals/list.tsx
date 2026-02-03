import { useState } from "react";
import {
  Space,
  Table,
  Tag,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Checkbox,
  message,
} from "antd";
import { EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { List, useTable, ImageField } from "@refinedev/antd";
import { useUpdate, useDelete, useInvalidate } from "@refinedev/core";
import dayjs from "dayjs";


const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

// Available categories
const CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Health & Beauty",
  "Sports & Outdoors",
  "Books & Media",
  "Toys & Games",
  "Grocery",
  "Baby",
  "Pet Supplies",
  "Office",
  "Automotive",
  "Other",
];

// Expert verdict options for Amazon Associates compliance
const EXPERT_VERDICTS = ["BUY NOW", "WAIT", "PASS"];

// Retailer options
const RETAILERS = ["AMAZON", "WALMART", "TARGET", "BESTBUY", "EBAY", "COSTCO", "OTHER"];

interface Deal {
  id: string;
  title: string;
  description?: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  imageUrl?: string;
  affiliateLink: string;
  expiryDate?: string;
  isHot: boolean;
  isFeatured: boolean;
  category: string;
  couponCode?: string;
  promoDescription?: string;
  // Amazon Associates Compliance Fields
  originalAnalysis?: string;
  pros?: string[];
  cons?: string[];
  expertVerdict?: string;
  whenToBuy?: string;
  bestFor?: string;
  retailer?: string;
  priceHistoryJson?: string;
}

export const DealList = () => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [form] = Form.useForm();

  const { tableProps, sorters } = useTable<Deal>({
    resource: "deals/active",
    pagination: {
      pageSize: 10,
    },
    syncWithLocation: true,
    sorters: {
      initial: [{ field: "createdAt", order: "desc" }],
    },
  });

  const { mutate: updateDeal } = useUpdate();
  const { mutate: deleteDeal } = useDelete();
  const invalidate = useInvalidate();
  const [isUpdating, setIsUpdating] = useState(false);

  const refreshTable = () => {
    invalidate({
      resource: "deals/active",
      invalidates: ["list"],
    });
  };

  const isLoading = tableProps?.loading ?? false;
  const dataSource = tableProps?.dataSource ?? [];

  const handleEdit = (record: Deal) => {
    setEditingDeal(record);
    // Convert string prices to numbers for form validation
    // Convert arrays to comma-separated strings for form display
    form.setFieldsValue({
      ...record,
      price: parseFloat(String(record.price)) || 0,
      originalPrice: parseFloat(String(record.originalPrice)) || 0,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
      pros: Array.isArray(record.pros) ? record.pros.join(", ") : record.pros || "",
      cons: Array.isArray(record.cons) ? record.cons.join(", ") : record.cons || "",
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingDeal) return;

    setIsUpdating(true);

    // Convert comma-separated strings to arrays for pros/cons
    const prosArray = values.pros
      ? String(values.pros).split(",").map((s: string) => s.trim()).filter((s: string) => s)
      : [];
    const consArray = values.cons
      ? String(values.cons).split(",").map((s: string) => s.trim()).filter((s: string) => s)
      : [];

    const updateData = {
      ...values,
      expiryDate: values.expiryDate?.toISOString(),
      pros: prosArray,
      cons: consArray,
    };

    updateDeal(
      {
        resource: "deals",
        id: editingDeal.id,
        values: updateData,
      },
      {
        onSuccess: () => {
          setIsUpdating(false);
          message.success("Deal updated successfully");
          setEditModalVisible(false);
          setEditingDeal(null);
          form.resetFields();
          refreshTable();
        },
        onError: (error) => {
          setIsUpdating(false);
          message.error(`Failed to update deal: ${error.message}`);
        },
      }
    );
  };

  const handleDelete = (record: Deal) => {
    Modal.confirm({
      title: "Are you sure you want to delete this deal?",
      icon: <ExclamationCircleOutlined />,
      content: `"${record.title.substring(0, 50)}..." will be permanently deleted.`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        return new Promise((resolve, reject) => {
          deleteDeal(
            {
              resource: "deals",
              id: record.id,
            },
            {
              onSuccess: () => {
                message.success("Deal deleted successfully");
                refreshTable();
                resolve(true);
              },
              onError: (error) => {
                message.error(`Failed to delete deal: ${error.message}`);
                reject(error);
              },
            }
          );
        });
      },
    });
  };

  return (
    <>
      <List title="Active Deals" resource="deals">
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
            render={(value, record: Deal) => (
              <ImageField value={value} width={60} style={{ borderRadius: 4 }} alt={record.title || "Deal image"} />
            )}
          />
          <Table.Column
            dataIndex="title"
            title="Title"
            sorter
            render={(value) => (
              <span style={{ maxWidth: 300, display: "block" }}>
                {value?.substring(0, 60)}...
              </span>
            )}
          />
          <Table.Column
            dataIndex="price"
            title="Price"
            sorter
            render={(value, record: Deal) => (
              <Space direction="vertical" size={0}>
                <Typography.Text strong style={{ color: "#2e7d32" }}>
                  {formatCurrency(parseFloat(String(value)))}
                </Typography.Text>
                <Typography.Text type="secondary">
                  <span style={{ textDecoration: "line-through" }}>
                    {formatCurrency(parseFloat(String(record.originalPrice)))}
                  </span>
                </Typography.Text>
              </Space>
            )}
          />
          <Table.Column
            dataIndex="discountPercentage"
            title="Discount"
            sorter
            render={(value) => (
              <Tag color="red">{parseFloat(String(value))?.toFixed(0)}% OFF</Tag>
            )}
          />
          <Table.Column
            dataIndex="category"
            title="Category"
            sorter
          />
          <Table.Column
            dataIndex="isHot"
            title="Hot"
            render={(value) => (
              value ? <Tag color="volcano">HOT</Tag> : null
            )}
          />
          <Table.Column
            dataIndex="createdAt"
            title="Created"
            sorter
            render={(value) => (
              value ? dayjs(value).format("MMM D, YYYY") : "-"
            )}
          />
          <Table.Column
            title="Actions"
            fixed="right"
            width={120}
            render={(_, record: Deal) => (
              <Space>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => handleEdit(record)}
                />
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  onClick={() => handleDelete(record)}
                />
              </Space>
            )}
          />
        </Table>
      </List>

      {/* Edit Modal */}
      <Modal
        title="Edit Deal"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingDeal(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[
              { required: true, message: "Title is required" },
              { max: 255, message: "Title cannot exceed 255 characters" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Space style={{ display: "flex" }} align="start">
            <Form.Item
              name="price"
              label="Current Price"
              rules={[
                { required: true, message: "Price is required" },
                { type: "number", min: 0, message: "Price must be non-negative" },
              ]}
            >
              <InputNumber prefix="$" precision={2} min={0} style={{ width: 150 }} />
            </Form.Item>

            <Form.Item
              name="originalPrice"
              label="Original Price"
              rules={[
                { required: true, message: "Original price is required" },
                { type: "number", min: 0, message: "Price must be non-negative" },
              ]}
            >
              <InputNumber prefix="$" precision={2} min={0} style={{ width: 150 }} />
            </Form.Item>
          </Space>

          <Form.Item
            name="affiliateLink"
            label="Affiliate Link"
            rules={[
              { required: true, message: "Affiliate link is required" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="imageUrl"
            label="Image URL"
            rules={[{ type: "url", message: "Please enter a valid URL" }]}
          >
            <Input />
          </Form.Item>

          <Space style={{ display: "flex" }} align="start">
            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: "Category is required" }]}
            >
              <Select style={{ width: 200 }}>
                {CATEGORIES.map((cat) => (
                  <Select.Option key={cat} value={cat}>
                    {cat}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="couponCode" label="Coupon Code">
              <Input style={{ width: 150 }} />
            </Form.Item>

            <Form.Item name="expiryDate" label="Expiry Date">
              <DatePicker style={{ width: 150 }} />
            </Form.Item>
          </Space>

          <Form.Item name="promoDescription" label="Promo Description">
            <Input.TextArea rows={2} />
          </Form.Item>

          {/* Amazon Associates Compliance Fields */}
          <Typography.Title level={5} style={{ marginTop: 16, marginBottom: 8 }}>
            Editorial Analysis (Amazon Associates Compliance)
          </Typography.Title>

          <Form.Item
            name="originalAnalysis"
            label="Original Analysis"
            tooltip="50-150 word original analysis of this deal"
          >
            <Input.TextArea
              rows={3}
              placeholder="Write original analysis explaining why this is a good/bad deal..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Space style={{ display: "flex", width: "100%" }} align="start">
            <Form.Item
              name="expertVerdict"
              label="Expert Verdict"
              style={{ width: 150 }}
            >
              <Select allowClear placeholder="Select verdict">
                {EXPERT_VERDICTS.map((verdict) => (
                  <Select.Option key={verdict} value={verdict}>
                    {verdict}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="retailer"
              label="Retailer"
              style={{ width: 150 }}
            >
              <Select allowClear placeholder="Select retailer">
                {RETAILERS.map((retailer) => (
                  <Select.Option key={retailer} value={retailer}>
                    {retailer}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Space>

          <Form.Item
            name="pros"
            label="Pros (comma-separated)"
            tooltip="List advantages, separated by commas"
          >
            <Input.TextArea
              rows={2}
              placeholder="Great price, Fast shipping, High quality..."
            />
          </Form.Item>

          <Form.Item
            name="cons"
            label="Cons (comma-separated)"
            tooltip="List disadvantages, separated by commas"
          >
            <Input.TextArea
              rows={2}
              placeholder="Limited colors, No warranty, Slow delivery..."
            />
          </Form.Item>

          <Form.Item
            name="whenToBuy"
            label="When to Buy"
            tooltip="Timing recommendation for this purchase"
          >
            <Input.TextArea
              rows={2}
              placeholder="Buy now - this is the lowest price we've seen in 30 days..."
            />
          </Form.Item>

          <Form.Item
            name="bestFor"
            label="Best For"
            tooltip="Target audience for this deal"
          >
            <Input
              placeholder="Budget shoppers, Tech enthusiasts, Parents..."
              maxLength={255}
            />
          </Form.Item>

          <Space>
            <Form.Item name="isHot" valuePropName="checked" noStyle>
              <Checkbox>Hot Deal</Checkbox>
            </Form.Item>
            <Form.Item name="isFeatured" valuePropName="checked" noStyle>
              <Checkbox>Featured</Checkbox>
            </Form.Item>
          </Space>

          <Form.Item style={{ marginTop: 24 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={isUpdating}>
                Save Changes
              </Button>
              <Button onClick={() => {
                setEditModalVisible(false);
                setEditingDeal(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DealList;
