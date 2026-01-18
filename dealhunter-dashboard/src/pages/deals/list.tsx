import { Avatar, Space, Table, Tag, Typography } from "antd";
import { List, useTable, ImageField } from "@refinedev/antd";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

export const DealList = () => {
  const { tableProps } = useTable({
    resource: "deals/active",
    pagination: {
      pageSize: 10,
    },
    syncWithLocation: true,
  });

  const isLoading = tableProps?.loading ?? false;
  const dataSource = tableProps?.dataSource ?? [];

  console.log("[DealList] isLoading:", isLoading);
  console.log("[DealList] dataSource:", dataSource);

  return (
    <List title="Active Deals" resource="deals">
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
              <Typography.Text strong style={{ color: "#52c41a" }}>
                {formatCurrency(value)}
              </Typography.Text>
              <Typography.Text type="secondary">
                <span style={{ textDecoration: "line-through" }}>
                  {formatCurrency(record.originalPrice)}
                </span>
              </Typography.Text>
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
          dataIndex="isHot"
          title="Hot"
          render={(value) => (
            value ? <Tag color="volcano">HOT</Tag> : null
          )}
        />
        <Table.Column
          dataIndex="affiliateLink"
          title="Link"
          render={(value) => (
            <a href={value} target="_blank" rel="noopener noreferrer">
              View on Amazon
            </a>
          )}
        />
      </Table>
    </List>
  );
};

export default DealList;
