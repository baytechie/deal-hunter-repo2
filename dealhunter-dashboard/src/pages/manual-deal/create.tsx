import { useState, useEffect } from "react";
import { useCreate, useNotification } from "@refinedev/core";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Checkbox,
  Button,
  Alert,
  Space,
  Typography,
  Divider,
  Row,
  Col,
  Statistic,
  Spin,
} from "antd";
import {
  ScissorOutlined,
  SaveOutlined,
  ClearOutlined,
  DollarOutlined,
  PercentageOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  parseDealText,
  calculateDiscount,
  formatCurrency,
  type ParsedDealData,
} from "../../utils/dealTextParser";

const { TextArea } = Input;
const { Title, Text } = Typography;

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

interface DealFormValues {
  title: string;
  description?: string;
  price: number;
  originalPrice: number;
  imageUrl?: string;
  affiliateLink: string;
  expiryDate?: dayjs.Dayjs;
  isHot?: boolean;
  isFeatured?: boolean;
  category: string;
  couponCode?: string;
  promoDescription?: string;
}

export const ManualDealCreate = () => {
  const [form] = Form.useForm<DealFormValues>();
  const [rawText, setRawText] = useState("");
  const [parseResult, setParseResult] = useState<{
    missingFields: string[];
    parsed: boolean;
  }>({ missingFields: [], parsed: false });
  const [discount, setDiscount] = useState<number>(0);
  const navigate = useNavigate();
  const { open } = useNotification();
  const { mutate: createDeal } = useCreate();
  const [isLoading, setIsLoading] = useState(false);

  // Watch price changes to calculate discount
  const price = Form.useWatch("price", form);
  const originalPrice = Form.useWatch("originalPrice", form);

  useEffect(() => {
    if (price !== undefined && originalPrice !== undefined) {
      setDiscount(calculateDiscount(originalPrice, price));
    }
  }, [price, originalPrice]);

  const handleParse = () => {
    if (!rawText.trim()) {
      open?.({
        type: "error",
        message: "Nothing to parse",
        description: "Please paste some text to parse",
      });
      return;
    }

    const result = parseDealText(rawText);

    // Populate form with parsed data
    const formValues: Partial<DealFormValues> = {};

    if (result.data.title) formValues.title = result.data.title;
    if (result.data.price) formValues.price = result.data.price;
    if (result.data.originalPrice) formValues.originalPrice = result.data.originalPrice;
    if (result.data.affiliateLink) formValues.affiliateLink = result.data.affiliateLink;
    if (result.data.imageUrl) formValues.imageUrl = result.data.imageUrl;
    if (result.data.couponCode) formValues.couponCode = result.data.couponCode;
    if (result.data.category) formValues.category = result.data.category;
    if (result.data.expiryDate) {
      formValues.expiryDate = dayjs(result.data.expiryDate);
    }

    form.setFieldsValue(formValues);

    setParseResult({
      missingFields: result.missingFields,
      parsed: true,
    });

    open?.({
      type: "success",
      message: result.missingFields.length > 0 ? "Partial Parse" : "Parse Complete",
      description:
        result.missingFields.length > 0
          ? `Missing fields: ${result.missingFields.join(", ")}`
          : "All required fields extracted successfully",
    });
  };

  const handleSubmit = async (values: DealFormValues) => {
    setIsLoading(true);

    // Transform form values to API format
    const dealData = {
      title: values.title,
      description: values.description,
      price: values.price,
      originalPrice: values.originalPrice,
      imageUrl: values.imageUrl,
      affiliateLink: values.affiliateLink,
      expiryDate: values.expiryDate?.toISOString(),
      isHot: values.isHot || false,
      isFeatured: values.isFeatured || false,
      category: values.category,
      couponCode: values.couponCode,
      promoDescription: values.promoDescription,
    };

    createDeal(
      {
        resource: "deals",
        values: dealData,
      },
      {
        onSuccess: () => {
          setIsLoading(false);
          open?.({
            type: "success",
            message: "Deal Created",
            description: "The deal has been created successfully",
          });
          navigate("/deals");
        },
        onError: (error) => {
          setIsLoading(false);
          open?.({
            type: "error",
            message: "Error Creating Deal",
            description: error.message || "Failed to create the deal",
          });
        },
      }
    );
  };

  const handleReset = () => {
    form.resetFields();
    setRawText("");
    setParseResult({ missingFields: [], parsed: false });
    setDiscount(0);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Add Manual Deal</Title>
      <Text type="secondary">
        Paste deal information from retailer sites and auto-populate form fields.
      </Text>

      <Row gutter={24} style={{ marginTop: 24 }}>
        {/* Parse Section */}
        <Col xs={24} lg={10}>
          <Card title="Paste Deal Information" bordered={false}>
            <TextArea
              rows={12}
              placeholder={`Paste deal text here. Example:

Apple AirPods Pro (2nd Generation)
$189.99 (was $249.99)
Save 24% OFF!
https://www.amazon.com/dp/B0CHWRXH8B

Use code: SAVE20 at checkout
Expires: 2/28/2025`}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            <Space style={{ marginTop: 16 }}>
              <Button
                type="primary"
                icon={<ScissorOutlined />}
                onClick={handleParse}
              >
                Parse Text
              </Button>
              <Button icon={<ClearOutlined />} onClick={() => setRawText("")}>
                Clear
              </Button>
            </Space>

            {parseResult.parsed && parseResult.missingFields.length > 0 && (
              <Alert
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
                message="Missing Required Fields"
                description={`Please fill in: ${parseResult.missingFields.join(", ")}`}
              />
            )}

            {parseResult.parsed && parseResult.missingFields.length === 0 && (
              <Alert
                type="success"
                showIcon
                style={{ marginTop: 16 }}
                message="All Required Fields Extracted"
                description="Review the form and submit when ready"
              />
            )}
          </Card>

          {/* Discount Preview */}
          {(price || originalPrice) && (
            <Card
              title="Deal Preview"
              bordered={false}
              style={{ marginTop: 16 }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Current Price"
                    value={price || 0}
                    prefix={<DollarOutlined />}
                    precision={2}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Original Price"
                    value={originalPrice || 0}
                    prefix={<DollarOutlined />}
                    precision={2}
                    valueStyle={{
                      color: "#999",
                      textDecoration: "line-through",
                    }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Discount"
                    value={discount}
                    suffix="%"
                    prefix={<PercentageOutlined />}
                    valueStyle={{ color: "#f5222d" }}
                  />
                </Col>
              </Row>
              {originalPrice && price && (
                <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
                  Savings: {formatCurrency(originalPrice - price)}
                </Text>
              )}
            </Card>
          )}
        </Col>

        {/* Form Section */}
        <Col xs={24} lg={14}>
          <Card title="Deal Details" bordered={false}>
            <Spin spinning={isLoading}>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  isHot: false,
                  isFeatured: false,
                }}
              >
                {/* Title */}
                <Form.Item
                  name="title"
                  label="Title"
                  rules={[
                    { required: true, message: "Title is required" },
                    { min: 5, message: "Title must be at least 5 characters" },
                    { max: 255, message: "Title cannot exceed 255 characters" },
                  ]}
                >
                  <Input placeholder="Enter deal title" />
                </Form.Item>

                {/* Description */}
                <Form.Item
                  name="description"
                  label="Description"
                >
                  <TextArea rows={3} placeholder="Enter deal description (optional)" />
                </Form.Item>

                {/* Prices */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="price"
                      label="Current Price"
                      rules={[
                        { required: true, message: "Price is required" },
                        {
                          type: "number",
                          min: 0,
                          message: "Price must be non-negative",
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        prefix="$"
                        precision={2}
                        min={0}
                        placeholder="19.99"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="originalPrice"
                      label="Original Price"
                      rules={[
                        { required: true, message: "Original price is required" },
                        {
                          type: "number",
                          min: 0,
                          message: "Price must be non-negative",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("price") <= value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("Original price should be >= current price")
                            );
                          },
                        }),
                      ]}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        prefix="$"
                        precision={2}
                        min={0}
                        placeholder="29.99"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Affiliate Link */}
                <Form.Item
                  name="affiliateLink"
                  label="Affiliate Link"
                  rules={[
                    { required: true, message: "Affiliate link is required" },
                    { type: "url", message: "Please enter a valid URL" },
                  ]}
                >
                  <Input placeholder="https://www.amazon.com/dp/..." />
                </Form.Item>

                {/* Image URL */}
                <Form.Item
                  name="imageUrl"
                  label="Image URL"
                  rules={[{ type: "url", message: "Please enter a valid URL" }]}
                >
                  <Input placeholder="https://example.com/image.jpg (optional)" />
                </Form.Item>

                {/* Category */}
                <Form.Item
                  name="category"
                  label="Category"
                  rules={[
                    { required: true, message: "Category is required" },
                    { max: 100, message: "Category cannot exceed 100 characters" },
                  ]}
                >
                  <Select placeholder="Select a category">
                    {CATEGORIES.map((cat) => (
                      <Select.Option key={cat} value={cat}>
                        {cat}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Coupon Code & Expiry Date */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="couponCode"
                      label="Coupon Code"
                      rules={[
                        { max: 50, message: "Coupon code cannot exceed 50 characters" },
                      ]}
                    >
                      <Input placeholder="SAVE20 (optional)" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="expiryDate"
                      label="Expiry Date"
                      rules={[
                        {
                          validator(_, value) {
                            if (!value || value.isAfter(dayjs())) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("Expiry date must be in the future")
                            );
                          },
                        },
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        format="YYYY-MM-DD"
                        placeholder="Select expiry date (optional)"
                        disabledDate={(current) =>
                          current && current < dayjs().startOf("day")
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>

                {/* Promo Description */}
                <Form.Item
                  name="promoDescription"
                  label="Promo Description"
                >
                  <TextArea
                    rows={2}
                    placeholder="Additional promotion details (optional)"
                  />
                </Form.Item>

                {/* Flags */}
                <Form.Item>
                  <Space size="large">
                    <Form.Item name="isHot" valuePropName="checked" noStyle>
                      <Checkbox>Mark as Hot Deal</Checkbox>
                    </Form.Item>
                    <Form.Item name="isFeatured" valuePropName="checked" noStyle>
                      <Checkbox>Mark as Featured</Checkbox>
                    </Form.Item>
                  </Space>
                </Form.Item>

                <Divider />

                {/* Actions */}
                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={isLoading}
                    >
                      Create Deal
                    </Button>
                    <Button icon={<ClearOutlined />} onClick={handleReset}>
                      Reset Form
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManualDealCreate;
