import { useState } from "react";
import { Avatar, Button, Space, Table, Tag, Typography } from "antd";
import { List, useTable } from "@refinedev/antd";
import { useDelete, useNavigation, useUpdate } from "@refinedev/core";

import type { Deal } from "../../providers/dummyDataProvider";

const statusColorMap: Record<Deal["status"], string> = {
  active: "green",
  pending: "orange",
  expired: "red",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatCurrency = (value: number) => currencyFormatter.format(value);

export const DealList = () => {
  const { tableProps } = useTable<Deal>({
    resource: "deals",
    pagination: {
      pageSize: 5,
    },
    syncWithLocation: true,
  });

  const { edit } = useNavigation();
  const { mutate: deleteDeal } = useDelete();
  const { mutate: updateDeal } = useUpdate();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setDeletingId(id);
    deleteDeal(
      { resource: "deals", id },
      {
        onSettled: () => setDeletingId(null),
      }
    );
  };

  const handleApprove = (record: Deal) => {
    if (record.status === "active") {
      return;
    }

    setApprovingId(record.id);
    updateDeal(
      {
        resource: "deals",
        id: record.id,
        values: { status: "active" },
      },
      {
        onSettled: () => setApprovingId(null),
      }
    );
  };

  return (
    <List title="Deals" resource="deals">
      <Table
        {...tableProps}
        rowKey="id"
        pagination={{
          ...(tableProps.pagination ?? {}),
          showSizeChanger: true,
        }}
      >
        <Table.Column<Deal>
          dataIndex="imageUrl"
          title="Image"
          render={(value, record) => (
            <Avatar shape="square" size={64} src={value} alt={record.title} />
          )}
        />
        <Table.Column<Deal>
          dataIndex="title"
          title="Title"
          render={(value, record) => (
            <Typography.Link onClick={() => edit("deals", record.id)}>
              {value}
            </Typography.Link>
          )}
        />
        <Table.Column<Deal>
          dataIndex="price"
          title="Price"
          render={(_, record) => (
            <Space direction="vertical" size={0}>
              <Typography.Text strong>
                {formatCurrency(record.price)}
              </Typography.Text>
              <Typography.Text type="secondary">
                <span style={{ textDecoration: "line-through" }}>
                  {formatCurrency(record.originalPrice)}
                </span>
              </Typography.Text>
            </Space>
          )}
        />
        <Table.Column<Deal>
          dataIndex="status"
          title="Status"
          filters={[
            { text: "Active", value: "active" },
            { text: "Pending", value: "pending" },
            { text: "Expired", value: "expired" },
          ]}
          filterMultiple={false}
          render={(status: Deal["status"]) => (
            <Tag color={statusColorMap[status]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Tag>
          )}
        />
        <Table.Column<Deal>
          title="Actions"
          dataIndex="actions"
          render={(_, record) => (
            <Space size="middle">
              <Button type="link" onClick={() => edit("deals", record.id)}>
                Edit
              </Button>
              <Button
                type="link"
                danger
                loading={deletingId === record.id}
                onClick={() => handleDelete(record.id)}
              >
                Delete
              </Button>
              <Button
                type="primary"
                ghost
                disabled={record.status === "active"}
                loading={approvingId === record.id}
                onClick={() => handleApprove(record)}
              >
                Approve
              </Button>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

export default DealList;
