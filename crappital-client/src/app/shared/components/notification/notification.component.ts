import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorNotificationService } from '../../services/error-notification.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-notification',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.less'],
})
export class NotificationComponent implements OnInit, OnDestroy {
    notification: string | null = null;
    visible = false;
    decay = 100;
    private decayTimer: any;
    private sub: Subscription | undefined;
    isHovered = false;

    constructor(private errorService: ErrorNotificationService) {}

    ngOnInit() {
        this.sub = this.errorService.notification$.subscribe((n) => {
            if (n) {
                this.notification = n.message;
                this.visible = true;
                this.startDecay();
            } else {
                this.reset();
            }
        });
    }

    startDecay() {
        this.decay = 100;
        if (this.decayTimer) {
            clearInterval(this.decayTimer);
        }
        this.decayTimer = setInterval(() => {
            if (!this.isHovered) {
                this.decay -= 1;
                if (this.decay <= 0) {
                    this.visible = false;
                    this.errorService.clear();
                    this.reset();
                }
            }
        }, 50);
    }

    onMouseEnter() {
        this.isHovered = true;
    }

    onMouseLeave() {
        this.isHovered = false;
    }

    reset() {
        this.notification = null;
        if (this.decayTimer) clearInterval(this.decayTimer);
        this.decay = 100;
        this.isHovered = false;
    }

    ngOnDestroy() {
        if (this.sub) {
            this.sub.unsubscribe();
        }
        if (this.decayTimer) {
            clearInterval(this.decayTimer);
        }
    }
}
