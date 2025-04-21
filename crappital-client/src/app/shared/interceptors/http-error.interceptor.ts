import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { ErrorNotificationService } from '../services/error-notification.service';
import { catchError } from 'rxjs/operators';

const SILENCED_ENDPOINTS = ['/core/auth/status'];

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
    const errorService = inject(ErrorNotificationService);
    const shouldSilence = SILENCED_ENDPOINTS.some((pattern) => req.url.includes(pattern));
    return next(req).pipe(
        catchError((error: any) => {
            if (!shouldSilence) {
                if (error?.error?.error) {
                    errorService.showError(error.error.error);
                } else {
                    errorService.showError();
                }
            }
            throw error;
        }),
    );
};
