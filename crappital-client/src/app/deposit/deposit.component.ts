import { Component, OnInit } from '@angular/core';
import { Account, AccountsService, AuthService, CurrenciesService } from '../generated/core-api';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CurrencyPickerComponent } from '../shared/components/currency-picker/currency-picker.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-deposit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule, MatCardModule, CurrencyPickerComponent, MatSnackBarModule],
    templateUrl: './deposit.component.html',
    styleUrl: './deposit.component.less',
})
export class DepositComponent implements OnInit {
    accounts: Account[] = [];
    userId: string | undefined;
    depositForm: FormGroup;
    selectedAccount: Account | null = null;
    convertedAmount: number | null = null;

    constructor(
        private accountsService: AccountsService,
        private authService: AuthService,
        private currenciesService: CurrenciesService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
    ) {
        this.depositForm = this.fb.group({
            account: [null, Validators.required],
            amount: [null, [Validators.required, Validators.min(0.01)]],
            currency: [null, Validators.required],
        });
    }

    ngOnInit(): void {
        this.authService.coreAuthStatusGet().subscribe((user) => {
            this.userId = user._id;
            if (this.userId) {
                this.accountsService.coreAccountsUserIdGet(this.userId).subscribe((accounts) => {
                    this.accounts = accounts;
                    if (accounts.length > 0) {
                        this.depositForm.get('account')?.setValue(accounts[0]);
                        this.onAccountSelect(accounts[0]);
                    }
                });
            }
        });

        this.depositForm.get('currency')?.valueChanges.subscribe(() => {
            this.updateConversion();
        });

        this.depositForm.get('amount')?.valueChanges.subscribe(() => {
            this.updateConversion();
        });
    }

    onAccountSelect(account: Account): void {
        this.selectedAccount = account;

        if (account && account.currency) {
            this.depositForm.get('currency')?.setValue(account.currency);
            this.updateConversion();
        }
    }

    isCurrencyDifferent(): boolean {
        if (!this.selectedAccount?.currency || !this.depositForm.get('currency')?.value) {
            return false;
        }

        const accountCurrency = this.selectedAccount.currency;
        const selectedCurrency = this.depositForm.get('currency')?.value;

        return accountCurrency.code !== selectedCurrency.code;
    }

    updateConversion(): void {
        if (!this.isCurrencyDifferent() || !this.depositForm.get('amount')?.value) {
            this.convertedAmount = null;
            return;
        }

        const amount = this.depositForm.get('amount')?.value;
        const selectedCurrency = this.depositForm.get('currency')?.value;

        this.currenciesService.coreCurrenciesConvertGet(selectedCurrency.code, this.selectedAccount!.currency.code, amount).subscribe((result) => {
            this.convertedAmount = result.result || null;
        });
    }

    onSubmit(): void {
        if (this.depositForm.valid && this.selectedAccount && this.userId) {
            const amount = this.depositForm.get('amount')?.value;
            const depositAmount = this.isCurrencyDifferent() ? this.convertedAmount : amount;

            if (depositAmount === null || depositAmount === undefined) {
                this.snackBar.open('Error calculating deposit amount.', 'Close', {
                    duration: 3000,
                    verticalPosition: 'top',
                });
                return;
            }

            const depositRequest = {
                balance: depositAmount,
            };

            this.accountsService.coreAccountsUserIdAccountIdBalancePut(this.userId, this.selectedAccount._id!, depositRequest).subscribe({
                next: (updatedAccount) => {
                    this.snackBar.open('Deposit successful!', 'Close', {
                        duration: 3000,
                        verticalPosition: 'top',
                    });
                    this.selectedAccount = updatedAccount;
                    this.depositForm.get('amount')?.reset();
                    this.convertedAmount = null;
                },
            });
        }
    }
}
