import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../services/logger.service';

/**
 * Global exception filter that catches all HTTP exceptions
 * and logs them using the custom LoggerService
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
    let errorResponse: any;

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
        errorResponse = exceptionResponse;
        message =
          (exceptionResponse as any).message ||
          (exceptionResponse as any).error ||
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

    // Log the error with stack trace
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      stack,
      'AllExceptionsFilter',
    );

    // Log additional request details for debugging
    this.logger.logWithMeta('error', 'Exception details', {
      context: 'AllExceptionsFilter',
      statusCode: status,
      method: request.method,
      url: request.url,
      body: request.body,
      query: request.query,
      params: request.params,
      headers: {
        'user-agent': request.headers['user-agent'],
        'content-type': request.headers['content-type'],
      },
      timestamp: new Date().toISOString(),
      errorMessage: message,
      stack: stack,
    });

    // Send the error response
    response.status(status).json({
      ...errorResponse,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
