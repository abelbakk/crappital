import { Component, OnInit } from '@angular/core';
import { Account, AccountsService, Transaction, TransactionsService, TransactionStatusEnum } from '../../generated/core-api';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule, Location } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-account-details',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule, MatInputModule, MatIconModule, MatButtonModule],
    templateUrl: './account-details.component.html',
    styleUrl: './account-details.component.less',
})
export class AccountDetailsComponent implements OnInit {
    userId!: string;
    accountId!: string;

    account?: Account;
    form!: FormGroup;
    transactions?: Map<TransactionStatusEnum, Transaction[]>;

    constructor(
        private transactionsService: TransactionsService,
        private accountsService: AccountsService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private location: Location,
        private route: ActivatedRoute,
        private router: Router,
    ) {}

    isOwn(transaction: Transaction): boolean {
        return transaction.fromAccount._id === this.accountId;
    }

    ngOnInit() {
        this.userId = this.route.snapshot.paramMap.get('userId')!;
        this.accountId = this.route.snapshot.paramMap.get('accountId')!;
        this.form = this.fb.group({
            name: '',
        });
        this.loadAccountAndTransactions();
    }

    loadAccountAndTransactions() {
        forkJoin({
            acc: this.accountsService.coreAccountsUserIdAccountIdGet(this.userId, this.accountId),
            trs: this.transactionsService.coreTransactionsUserIdGet(this.userId),
        }).subscribe({
            next: ({ acc, trs }) => {
                this.account = acc;
                const txMap = new Map<TransactionStatusEnum, Transaction[]>();
                for (const transaction of trs) {
                    if (!(transaction.fromAccount._id === this.accountId || transaction.toAccount._id === this.accountId)) {
                        continue;
                    }
                    if (transaction.status) {
                        if (!txMap.has(transaction.status)) {
                            txMap.set(transaction.status, []);
                        }
                        txMap.get(transaction.status)!.push(transaction);
                    }
                }
                this.transactions = txMap;
                this.form.patchValue({
                    name: this.account.name,
                });
            },
        });
    }

    onSave() {
        if (this.account) {
            const updatedAccount = {
                ...this.account,
                name: this.form.value.name || this.account.name,
            };

            this.accountsService.coreAccountsUserIdAccountIdPut(this.userId, this.accountId, updatedAccount).subscribe({
                next: () => {
                    this.snackBar.open('Account updated successfully', 'Close', {
                        duration: 3000,
                    });
                    this.loadAccountAndTransactions();
                },
            });
        }
    }

    onDelete() {
        if (this.account && confirm("Are you sure you want to delete your account? We'll keep your money.")) {
            this.accountsService.coreAccountsUserIdAccountIdDelete(this.userId, this.accountId).subscribe((_) => {
                this.snackBar.open('Account deleted successfully', 'Close', {
                    duration: 3000,
                });
                this.goBack();
            });
        }
    }

    goBack() {
        this.location.back();
    }

    goToDetails(transactionId: string) {
        this.router.navigate(['/transactions', this.userId, transactionId]);
    }
}
