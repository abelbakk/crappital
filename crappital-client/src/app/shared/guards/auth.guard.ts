import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../generated/core-api/api/auth.service';
import { catchError, of, map } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
    const r = inject(Router);
    return inject(AuthService)
        .coreAuthStatusGet()
        .pipe(
            map(() => true),
            catchError(() => {
                r.navigateByUrl('/home');
                return of(false);
            }),
        );
};
