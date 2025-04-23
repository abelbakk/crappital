import { Component, OnInit } from '@angular/core';
import { Account, AccountsService, AuthService } from '../generated/core-api';
import { CommonModule } from '@angular/common';
import { SpendingWidgetComponent } from './spending-widget/spending-widget.component';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, SpendingWidgetComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.less',
})
export class DashboardComponent implements OnInit {
    userId: string | undefined;
    widgets: Array<{ account?: Account }> = [];

    constructor(
        private authService: AuthService,
        private accountsService: AccountsService,
    ) {}

    ngOnInit(): void {
        this.authService.coreAuthStatusGet().subscribe((user) => {
            this.userId = user._id;
            this.widgets.push({});
            if (this.userId) {
                this.accountsService.coreAccountsUserIdGet(this.userId).subscribe((accounts) => accounts.forEach((a) => this.widgets.push({ account: a })));
            }
        });
    }
}
