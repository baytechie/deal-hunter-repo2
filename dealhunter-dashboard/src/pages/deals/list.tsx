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

const { confirm } = Modal;

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
    form.setFieldsValue({
      ...record,
      expiryDate: record.expiryDate ? dayjs(record.expiryDate) : null,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingDeal) return;

    setIsUpdating(true);
    const updateData = {
      ...values,
      expiryDate: values.expiryDate?.toISOString(),
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
    confirm({
      title: "Are you sure you want to delete this deal?",
      icon: <ExclamationCircleOutlined />,
      content: `"${record.title}" will be permanently deleted.`,
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk() {
        deleteDeal(
          {
            resource: "deals",
            id: record.id,
          },
          {
            onSuccess: () => {
              message.success("Deal deleted successfully");
              refreshTable();
            },
            onError: (error) => {
              message.error(`Failed to delete deal: ${error.message}`);
            },
          }
        );
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
