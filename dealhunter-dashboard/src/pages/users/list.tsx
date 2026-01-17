import { useState } from "react";
import { Button, Space, Table, Tag } from "antd";
import { List, useTable } from "@refinedev/antd";
import { useUpdate } from "@refinedev/core";

import type { User } from "../../providers/dummyDataProvider";

const roleColorMap: Record<User["role"], string> = {
  admin: "purple",
  user: "blue",
};

const statusColorMap: Record<User["status"], string> = {
  active: "green",
  banned: "red",
};

export const UserList = () => {
  const { tableProps } = useTable<User>({
    resource: "users",
    pagination: {
      pageSize: 10,
    },
    syncWithLocation: true,
  });

  const { mutate: updateUser } = useUpdate();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const handleToggleBan = (record: User) => {
    setTogglingId(record.id);
    updateUser(
      {
        resource: "users",
        id: record.id,
        values: { status: record.status === "active" ? "banned" : "active" },
      },
      {
        onSettled: () => setTogglingId(null),
      }
    );
  };

  return (
    <List title="Users" resource="users">
      <Table
        {...tableProps}
        rowKey="id"
        pagination={{
          ...(tableProps.pagination ?? {}),
          showSizeChanger: true,
        }}
      >
        <Table.Column<User> dataIndex="id" title="ID" width={80} />
        <Table.Column<User> dataIndex="username" title="Username" />
        <Table.Column<User> dataIndex="email" title="Email" />
        <Table.Column<User>
          dataIndex="role"
          title="Role"
          filters={[
            { text: "Admin", value: "admin" },
            { text: "User", value: "user" },
          ]}
          filterMultiple={false}
          render={(role: User["role"]) => (
            <Tag color={roleColorMap[role]}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Tag>
          )}
        />
        <Table.Column<User>
          dataIndex="status"
          title="Status"
          filters={[
            { text: "Active", value: "active" },
            { text: "Banned", value: "banned" },
          ]}
          filterMultiple={false}
          render={(status: User["status"]) => (
            <Tag color={statusColorMap[status]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Tag>
          )}
        />
        <Table.Column<User>
          title="Actions"
          dataIndex="actions"
          render={(_, record) => (
            <Space size="middle">
              <Button
                type={record.status === "active" ? "primary" : "default"}
                danger={record.status === "active"}
                loading={togglingId === record.id}
                onClick={() => handleToggleBan(record)}
              >
                {record.status === "active" ? "Ban User" : "Unban User"}
              </Button>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

export default UserList;
