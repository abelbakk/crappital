import { Component, OnInit } from '@angular/core';
import { Account, AccountsService, AuthService } from '../generated/core-api';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule, MatIconButton } from '@angular/material/button';

@Component({
    selector: 'app-accounts',
    imports: [CommonModule, MatIconModule, MatButtonModule, MatIconButton],
    templateUrl: './accounts.component.html',
    styleUrl: './accounts.component.less',
})
export class AccountsComponent implements OnInit {
    accounts: Account[] = [];
    userId: string | undefined;

    constructor(
        private accountsService: AccountsService,
        private authService: AuthService,
        private clipboard: Clipboard,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.authService.coreAuthStatusGet().subscribe((user) => {
            this.userId = user._id;
            if (this.userId) {
                this.accountsService.coreAccountsUserIdGet(this.userId).subscribe((accounts) => (this.accounts = accounts));
            }
        });
    }

    copyNumber(accountNumber: string) {
        this.clipboard.copy(accountNumber);
    }

    goToDetails(accountId: string) {
        this.router.navigate(['/accounts', this.userId, accountId]);
    }
}
