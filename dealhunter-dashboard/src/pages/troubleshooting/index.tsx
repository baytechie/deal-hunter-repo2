import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Tabs,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Card,
  Row,
  Col,
  Typography,
  message,
  Tooltip,
} from "antd";
import {
  ReloadOutlined,
  ClearOutlined,
  SearchOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { List } from "@refinedev/antd";
import { logger, type LogEntry } from "../../services/logger";

const { Text } = Typography;
const { TabPane } = Tabs;

// API URL for backend logs
const API_URL = import.meta.env.VITE_API_URL || "https://api.huntdeals.app";

const getToken = (): string | null => {
  return localStorage.getItem("refine-auth");
};

interface BackendLogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  correlationId?: string;
  stack?: string;
}

const levelColorMap: Record<string, string> = {
  debug: "default",
  info: "blue",
  warn: "orange",
  error: "red",
  verbose: "purple",
};

const levelOptions = [
  { label: "All Levels", value: "" },
  { label: "Debug", value: "debug" },
  { label: "Info", value: "info" },
  { label: "Warn", value: "warn" },
  { label: "Error", value: "error" },
];

export const TroubleshootingPage = () => {
  // Admin logs state
  const [adminLogs, setAdminLogs] = useState<LogEntry[]>([]);
  const [adminLevelFilter, setAdminLevelFilter] = useState<string>("");
  const [adminSearchText, setAdminSearchText] = useState<string>("");

  // Backend logs state
  const [backendLogs, setBackendLogs] = useState<BackendLogEntry[]>([]);
  const [backendLevelFilter, setBackendLevelFilter] = useState<string>("");
  const [backendContextFilter, setBackendContextFilter] = useState<string>("");
  const [backendSearchText, setBackendSearchText] = useState<string>("");
  const [backendLoading, setBackendLoading] = useState(false);

  // Fetch admin logs from window.__adminLogger
  const fetchAdminLogs = useCallback(() => {
    const logs = logger.getLogs();
    setAdminLogs(logs);
  }, []);

  // Fetch backend logs from API
  const fetchBackendLogs = useCallback(async () => {
    setBackendLoading(true);
    try {
      const params = new URLSearchParams();
      if (backendLevelFilter) params.append("level", backendLevelFilter);
      if (backendContextFilter) params.append("context", backendContextFilter);
      if (backendSearchText) params.append("search", backendSearchText);
      params.append("limit", "500");

      const response = await fetch(`${API_URL}/admin/logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch backend logs");
      }

      const result = await response.json();
      setBackendLogs(result.data || []);
    } catch (error) {
      console.error("Error fetching backend logs:", error);
      message.error("Failed to fetch backend logs");
    } finally {
      setBackendLoading(false);
    }
  }, [backendLevelFilter, backendContextFilter, backendSearchText]);

  // Initial load
  useEffect(() => {
    fetchAdminLogs();
    fetchBackendLogs();
  }, []);

  // Refresh backend logs when filters change
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchBackendLogs();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [backendLevelFilter, backendContextFilter, backendSearchText]);

  // Filter admin logs
  const filteredAdminLogs = adminLogs.filter((log) => {
    const matchesLevel = !adminLevelFilter || log.level === adminLevelFilter;
    const matchesSearch =
      !adminSearchText ||
      log.message.toLowerCase().includes(adminSearchText.toLowerCase()) ||
      log.context.toLowerCase().includes(adminSearchText.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Clear admin logs
  const handleClearAdminLogs = () => {
    logger.clearLogs();
    setAdminLogs([]);
    message.success("Admin logs cleared");
  };

  // Clear backend logs
  const handleClearBackendLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/logs`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to clear backend logs");
      }

      setBackendLogs([]);
      message.success("Backend logs cleared");
    } catch (error) {
      console.error("Error clearing backend logs:", error);
      message.error("Failed to clear backend logs");
    }
  };

  // Export logs as JSON
  const handleExportLogs = (logs: any[], filename: string) => {
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Common table columns
  const getColumns = (source: "admin" | "backend") => [
    {
      title: "Timestamp",
      dataIndex: "timestamp",
      key: "timestamp",
      width: 180,
      render: (value: string) => (
        <Text style={{ fontSize: 12, fontFamily: "monospace" }}>
          {new Date(value).toLocaleString()}
        </Text>
      ),
      sorter: (a: any, b: any) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: 80,
      render: (level: string) => (
        <Tag color={levelColorMap[level] || "default"}>
          {level?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Context",
      dataIndex: "context",
      key: "context",
      width: 150,
      render: (context: string) => (
        <Text code style={{ fontSize: 11 }}>
          {context || "-"}
        </Text>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      ellipsis: true,
      render: (message: string) => (
        <Tooltip title={message}>
          <Text style={{ fontSize: 12 }}>{message}</Text>
        </Tooltip>
      ),
    },
    ...(source === "backend"
      ? [
          {
            title: "Correlation ID",
            dataIndex: "correlationId",
            key: "correlationId",
            width: 120,
            render: (id: string) =>
              id ? (
                <Text code style={{ fontSize: 10 }}>
                  {id.substring(0, 8)}...
                </Text>
              ) : (
                "-"
              ),
          },
        ]
      : []),
  ];

  // Filter controls component
  const FilterControls = ({
    levelFilter,
    setLevelFilter,
    searchText,
    setSearchText,
    onRefresh,
    onClear,
    onExport,
    loading,
    showContextFilter,
    contextFilter,
    setContextFilter,
  }: {
    levelFilter: string;
    setLevelFilter: (v: string) => void;
    searchText: string;
    setSearchText: (v: string) => void;
    onRefresh: () => void;
    onClear: () => void;
    onExport: () => void;
    loading?: boolean;
    showContextFilter?: boolean;
    contextFilter?: string;
    setContextFilter?: (v: string) => void;
  }) => (
    <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
      <Col xs={24} sm={12} md={6}>
        <Select
          style={{ width: "100%" }}
          placeholder="Filter by level"
          value={levelFilter}
          onChange={setLevelFilter}
          options={levelOptions}
        />
      </Col>
      {showContextFilter && setContextFilter && (
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Filter by context"
            value={contextFilter}
            onChange={(e) => setContextFilter(e.target.value)}
            allowClear
          />
        </Col>
      )}
      <Col xs={24} sm={12} md={showContextFilter ? 6 : 10}>
        <Input
          placeholder="Search messages..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
          >
            Refresh
          </Button>
          <Button icon={<DownloadOutlined />} onClick={onExport}>
            Export
          </Button>
          <Button icon={<ClearOutlined />} danger onClick={onClear}>
            Clear
          </Button>
        </Space>
      </Col>
    </Row>
  );

  return (
    <List title="Troubleshooting" resource="troubleshooting">
      <Card>
        <Tabs defaultActiveKey="admin">
          <TabPane tab={`Admin Logs (${filteredAdminLogs.length})`} key="admin">
            <FilterControls
              levelFilter={adminLevelFilter}
              setLevelFilter={setAdminLevelFilter}
              searchText={adminSearchText}
              setSearchText={setAdminSearchText}
              onRefresh={fetchAdminLogs}
              onClear={handleClearAdminLogs}
              onExport={() => handleExportLogs(filteredAdminLogs, "admin-logs")}
            />
            <Table
              dataSource={filteredAdminLogs}
              columns={getColumns("admin")}
              rowKey={(_record, index) => `admin-${index}`}
              size="small"
              pagination={{
                pageSize: 50,
                showSizeChanger: true,
                pageSizeOptions: ["25", "50", "100"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} logs`,
              }}
              scroll={{ x: 800 }}
            />
          </TabPane>

          <TabPane tab={`Backend Logs (${backendLogs.length})`} key="backend">
            <FilterControls
              levelFilter={backendLevelFilter}
              setLevelFilter={setBackendLevelFilter}
              searchText={backendSearchText}
              setSearchText={setBackendSearchText}
              onRefresh={fetchBackendLogs}
              onClear={handleClearBackendLogs}
              onExport={() => handleExportLogs(backendLogs, "backend-logs")}
              loading={backendLoading}
              showContextFilter
              contextFilter={backendContextFilter}
              setContextFilter={setBackendContextFilter}
            />
            <Table
              dataSource={backendLogs}
              columns={getColumns("backend")}
              rowKey={(_record, index) => `backend-${index}`}
              size="small"
              loading={backendLoading}
              pagination={{
                pageSize: 50,
                showSizeChanger: true,
                pageSizeOptions: ["25", "50", "100"],
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} logs`,
              }}
              scroll={{ x: 900 }}
              expandable={{
                expandedRowRender: (record: BackendLogEntry) =>
                  record.stack ? (
                    <pre
                      style={{
                        fontSize: 11,
                        background: "#f5f5f5",
                        padding: 8,
                        borderRadius: 4,
                        overflow: "auto",
                        maxHeight: 200,
                      }}
                    >
                      {record.stack}
                    </pre>
                  ) : null,
                rowExpandable: (record: BackendLogEntry) => !!record.stack,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </List>
  );
};

export default TroubleshootingPage;
