import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ERROR_MESSAGES, GENERIC_ERROR_MESSAGE } from '../constants/error-messages';

export interface ErrorNotification {
    message: string;
}

@Injectable({ providedIn: 'root' })
export class ErrorNotificationService {
    private notificationSubject = new BehaviorSubject<ErrorNotification | null>(null);

    get notification$(): Observable<ErrorNotification | null> {
        return this.notificationSubject.asObservable();
    }

    showError(errorCode?: string) {
        const message = errorCode && ERROR_MESSAGES[errorCode] ? ERROR_MESSAGES[errorCode] : GENERIC_ERROR_MESSAGE;
        this.notificationSubject.next({ message });
    }

    clear() {
        this.notificationSubject.next(null);
    }
}
