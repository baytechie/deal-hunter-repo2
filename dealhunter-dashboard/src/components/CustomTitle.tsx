import { Link } from "react-router-dom";

interface CustomTitleProps {
  collapsed: boolean;
}

export const CustomTitle: React.FC<CustomTitleProps> = ({ collapsed }) => {
  return (
    <Link
      to="/"
      style={{
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : 12,
        padding: "12px 16px",
        textDecoration: "none",
      }}
    >
      <img
        src="/logo-192.png"
        alt="Hunt Deals"
        style={{
          width: 28,
          height: 28,
        }}
      />
      {!collapsed && (
        <span
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#1890ff",
            whiteSpace: "nowrap",
          }}
        >
          Hunt Deals Admin
        </span>
      )}
    </Link>
  );
};

export default CustomTitle;
