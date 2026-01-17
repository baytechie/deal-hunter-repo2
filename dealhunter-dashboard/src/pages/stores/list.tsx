import { useState } from "react";
import { Button, Space, Table, Tag } from "antd";
import { List, useTable } from "@refinedev/antd";
import { useUpdate } from "@refinedev/core";

import type { Store } from "../../providers/dummyDataProvider";

const affiliateStatusColorMap: Record<Store["affiliateStatus"], string> = {
  active: "green",
  inactive: "red",
};

export const StoreList = () => {
  const { tableProps } = useTable<Store>({
    resource: "stores",
    pagination: {
      pageSize: 10,
    },
    syncWithLocation: true,
  });

  const { mutate: updateStore } = useUpdate();
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const handleToggleStatus = (record: Store) => {
    setTogglingId(record.id);
    updateStore(
      {
        resource: "stores",
        id: record.id,
        values: {
          affiliateStatus:
            record.affiliateStatus === "active" ? "inactive" : "active",
        },
      },
      {
        onSettled: () => setTogglingId(null),
      }
    );
  };

  return (
    <List title="Stores" resource="stores">
      <Table
        {...tableProps}
        rowKey="id"
        pagination={{
          ...(tableProps.pagination ?? {}),
          showSizeChanger: true,
        }}
      >
        <Table.Column<Store> dataIndex="id" title="ID" width={80} />
        <Table.Column<Store> dataIndex="name" title="Store Name" />
        <Table.Column<Store>
          dataIndex="affiliateStatus"
          title="Affiliate Status"
          filters={[
            { text: "Active", value: "active" },
            { text: "Inactive", value: "inactive" },
          ]}
          filterMultiple={false}
          render={(status: Store["affiliateStatus"]) => (
            <Tag color={affiliateStatusColorMap[status]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Tag>
          )}
        />
        <Table.Column<Store>
          title="Actions"
          dataIndex="actions"
          render={(_, record) => (
            <Space size="middle">
              <Button
                type={record.affiliateStatus === "active" ? "default" : "primary"}
                loading={togglingId === record.id}
                onClick={() => handleToggleStatus(record)}
              >
                {record.affiliateStatus === "active"
                  ? "Deactivate"
                  : "Activate"}
              </Button>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

export default StoreList;
