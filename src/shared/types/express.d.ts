/**
 * Express type extensions for the DealHunter application.
 * This file extends Express types to include custom properties.
 */

// Extend Express Request type to include correlationId
declare namespace Express {
  interface Request {
    correlationId?: string;
  }
}
