import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { BASE_PATH } from './generated/core-api';
import { Configuration } from './generated/core-api';

export const appConfig: ApplicationConfig = {
    providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideHttpClient(withFetch()),
        { provide: Configuration, useValue: new Configuration({ basePath: 'http://localhost:5000', withCredentials: true }) }
    ],
};
