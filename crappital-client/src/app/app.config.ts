import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { Configuration } from './generated/core-api';
import { httpErrorInterceptor } from './shared/interceptors/http-error.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withFetch(), withInterceptors([httpErrorInterceptor])),
        { provide: Configuration, useValue: new Configuration({ basePath: '', withCredentials: true }) },
    ],
};
