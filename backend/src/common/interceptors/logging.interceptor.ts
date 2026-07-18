import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '';
    const now = Date.now();

    // Sanitize request log info (do not log sensitive body properties)
    const sanitizedBody = { ...request.body };
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'refreshToken', 'accessToken', 'secret'];
    sensitiveKeys.forEach((key) => {
      if (key in sanitizedBody) {
        sanitizedBody[key] = '***';
      }
    });

    this.logger.log(
      `Incoming Request: ${method} ${url} - IP: ${ip} - User Agent: ${userAgent} - Body: ${JSON.stringify(
        sanitizedBody,
      )}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const delay = Date.now() - now;
          this.logger.log(
            `Outgoing Response: ${method} ${url} - Status: ${response.statusCode} - Duration: ${delay}ms`,
          );
        },
        error: (err: any) => {
          const delay = Date.now() - now;
          this.logger.error(
            `Failed Request: ${method} ${url} - Status: ${
              err.status || 500
            } - Duration: ${delay}ms - Error: ${err.message}`,
          );
        },
      }),
    );
  }
}
