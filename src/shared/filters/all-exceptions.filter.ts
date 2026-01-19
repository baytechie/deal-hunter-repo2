import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';
import {
  sanitizeRequestBody,
  sanitizeHeaders,
  sanitizeQuery,
} from '../utils/sanitize.util';

/**
 * Global exception filter that catches all HTTP exceptions
 * and logs them using the custom LoggerService.
 *
 * Features:
 * - Includes correlation ID in all error logs
 * - Sanitizes sensitive data (passwords, tokens, etc.) before logging
 * - Provides structured error responses with timestamps
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let errorResponse: Record<string, unknown>;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        errorResponse = {
          statusCode: status,
          message,
          error: HttpStatus[status],
        };
      } else {
        errorResponse = exceptionResponse as Record<string, unknown>;
        message =
          (exceptionResponse as Record<string, unknown>).message?.toString() ||
          (exceptionResponse as Record<string, unknown>).error?.toString() ||
          'An error occurred';
      }
    } else {
      // Handle non-HTTP exceptions (unexpected errors)
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      errorResponse = {
        statusCode: status,
        message,
        error: 'Internal Server Error',
      };
    }

    // Extract stack trace
    const stack =
      exception instanceof Error ? exception.stack : 'No stack trace available';

    // Get correlation ID for tracing
    const correlationId = this.logger.getCorrelationId();

    // Log the error with stack trace
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      stack,
      'AllExceptionsFilter',
    );

    // Sanitize sensitive data before logging
    const sanitizedBody = sanitizeRequestBody(request.body);
    const sanitizedQuery = sanitizeQuery(
      request.query as Record<string, unknown>,
    );
    const sanitizedHeaders = sanitizeHeaders({
      'user-agent': request.headers['user-agent'],
      'content-type': request.headers['content-type'],
      authorization: request.headers['authorization'],
      'x-api-key': request.headers['x-api-key'] as string | undefined,
    });

    // Log additional request details for debugging (with sanitized data)
    this.logger.logWithMeta('error', 'Exception details', {
      context: 'AllExceptionsFilter',
      correlationId,
      statusCode: status,
      method: request.method,
      url: request.url,
      body: sanitizedBody,
      query: sanitizedQuery,
      params: request.params,
      headers: sanitizedHeaders,
      timestamp: new Date().toISOString(),
      errorMessage: message,
      stack: stack,
    });

    // Send the error response
    response.status(status).json({
      ...errorResponse,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(correlationId && { correlationId }),
    });
  }
}
