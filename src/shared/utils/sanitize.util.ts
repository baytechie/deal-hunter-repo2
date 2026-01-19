/**
 * Utility functions for sanitizing sensitive data before logging.
 * These functions help prevent accidental exposure of credentials,
 * tokens, and other sensitive information in log files.
 */

/**
 * List of field names that should be redacted in request bodies.
 * Case-insensitive matching is used.
 */
const SENSITIVE_BODY_FIELDS = [
  'password',
  'passwd',
  'secret',
  'token',
  'accessToken',
  'access_token',
  'refreshToken',
  'refresh_token',
  'apiKey',
  'api_key',
  'apiSecret',
  'api_secret',
  'privateKey',
  'private_key',
  'creditCard',
  'credit_card',
  'cardNumber',
  'card_number',
  'cvv',
  'cvc',
  'ssn',
  'socialSecurityNumber',
  'pin',
  'otp',
  'authCode',
  'auth_code',
  'authorization',
  'sessionId',
  'session_id',
  'cookie',
];

/**
 * List of header names that should be redacted.
 * Case-insensitive matching is used.
 */
const SENSITIVE_HEADERS = [
  'authorization',
  'x-api-key',
  'x-auth-token',
  'cookie',
  'set-cookie',
  'x-csrf-token',
  'x-xsrf-token',
];

/**
 * Regex patterns for detecting sensitive data values.
 */
const SENSITIVE_PATTERNS = [
  // Credit card numbers (basic pattern)
  /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  // Social Security Numbers
  /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
  // Bearer tokens
  /Bearer\s+[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*/gi,
  // Basic auth
  /Basic\s+[A-Za-z0-9+/=]+/gi,
];

const REDACTED = '[REDACTED]';

/**
 * Check if a field name indicates sensitive data.
 * @param fieldName - The field name to check
 * @returns True if the field appears to contain sensitive data
 */
function isSensitiveField(fieldName: string): boolean {
  const lowerName = fieldName.toLowerCase();
  return SENSITIVE_BODY_FIELDS.some(
    (sensitiveField) =>
      lowerName === sensitiveField.toLowerCase() ||
      lowerName.includes(sensitiveField.toLowerCase()),
  );
}

/**
 * Check if a header name indicates sensitive data.
 * @param headerName - The header name to check
 * @returns True if the header appears to contain sensitive data
 */
function isSensitiveHeader(headerName: string): boolean {
  const lowerName = headerName.toLowerCase();
  return SENSITIVE_HEADERS.some(
    (sensitiveHeader) => lowerName === sensitiveHeader.toLowerCase(),
  );
}

/**
 * Redact sensitive patterns from a string value.
 * @param value - The string to check for sensitive patterns
 * @returns The string with sensitive patterns redacted
 */
function redactSensitivePatterns(value: string): string {
  let result = value;
  for (const pattern of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, REDACTED);
  }
  return result;
}

/**
 * Recursively sanitize an object by redacting sensitive fields.
 * Creates a deep copy to avoid mutating the original object.
 * @param obj - The object to sanitize
 * @param depth - Current recursion depth (to prevent infinite loops)
 * @returns A sanitized copy of the object
 */
export function sanitizeObject(
  obj: unknown,
  depth = 0,
): unknown {
  // Prevent infinite recursion
  if (depth > 10) {
    return '[MAX_DEPTH_EXCEEDED]';
  }

  // Handle null/undefined
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle primitives
  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return redactSensitivePatterns(obj);
    }
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }

  // Handle objects
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveField(key)) {
      sanitized[key] = REDACTED;
    } else if (typeof value === 'string') {
      sanitized[key] = redactSensitivePatterns(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitize request body for logging.
 * @param body - The request body to sanitize
 * @returns A sanitized copy of the body
 */
export function sanitizeRequestBody(
  body: unknown,
): unknown {
  return sanitizeObject(body);
}

/**
 * Sanitize headers for logging.
 * Redacts sensitive header values while preserving structure.
 * @param headers - The headers object to sanitize
 * @returns A sanitized copy of the headers
 */
export function sanitizeHeaders(
  headers: Record<string, string | string[] | undefined>,
): Record<string, string | string[] | undefined> {
  const sanitized: Record<string, string | string[] | undefined> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (isSensitiveHeader(key)) {
      sanitized[key] = REDACTED;
    } else if (typeof value === 'string') {
      sanitized[key] = redactSensitivePatterns(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((v) => redactSensitivePatterns(v));
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitize query parameters for logging.
 * @param query - The query parameters to sanitize
 * @returns A sanitized copy of the query parameters
 */
export function sanitizeQuery(
  query: Record<string, unknown>,
): Record<string, unknown> {
  return sanitizeObject(query) as Record<string, unknown>;
}
