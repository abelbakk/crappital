import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CurrencyPickerComponent } from '../shared/components/currency-picker/currency-picker.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Account, AccountsService, AuthService, CategoriesService, Category, CurrenciesService, TransactionsService } from '../generated/core-api';

@Component({
    selector: 'app-new-transaction',
    standalone: true,
    templateUrl: './new-transaction.component.html',
    imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule, MatCardModule, CurrencyPickerComponent, MatSnackBarModule],
    styleUrls: ['./new-transaction.component.less'],
})
export class NewTransactionComponent implements OnInit {
    accounts: Account[] = [];
    userId: string | undefined;
    newTransactionForm: FormGroup;
    selectedAccount: Account | null = null;
    convertedAmount: number | null = null;
    categories: Category[] = [];

    constructor(
        private accountsService: AccountsService,
        private authService: AuthService,
        private currenciesService: CurrenciesService,
        private categoriesService: CategoriesService,
        private transactionsService: TransactionsService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
    ) {
        this.newTransactionForm = this.fb.group({
            account: [null, Validators.required],
            toAccountNumber: [null, [Validators.required, Validators.minLength(30), Validators.maxLength(30)]],
            amount: [null, [Validators.required, Validators.min(0.01)]],
            category: [null, Validators.required],
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
                        this.newTransactionForm.get('account')?.setValue(accounts[0]);
                        this.onAccountSelect(accounts[0]);
                    }
                });
            }
        });

        this.categoriesService.coreCategoriesGet().subscribe((categories) => {
            this.categories = categories;
        });

        this.newTransactionForm.get('currency')?.valueChanges.subscribe(() => {
            this.updateConversion();
        });

        this.newTransactionForm.get('amount')?.valueChanges.subscribe(() => {
            this.updateConversion();
        });
    }

    onAccountSelect(account: Account): void {
        this.selectedAccount = account;

        if (account && account.currency) {
            this.newTransactionForm.get('currency')?.setValue(account.currency);
            this.updateConversion();
        }
    }

    isCurrencyDifferent(): boolean {
        if (!this.selectedAccount?.currency || !this.newTransactionForm.get('currency')?.value) {
            return false;
        }

        const accountCurrency = this.selectedAccount.currency;
        const selectedCurrency = this.newTransactionForm.get('currency')?.value;

        return accountCurrency.code !== selectedCurrency.code;
    }

    updateConversion(): void {
        if (!this.isCurrencyDifferent() || !this.newTransactionForm.get('amount')?.value) {
            this.convertedAmount = null;
            return;
        }

        const amount = this.newTransactionForm.get('amount')?.value;
        const selectedCurrency = this.newTransactionForm.get('currency')?.value;

        this.currenciesService.coreCurrenciesConvertGet(selectedCurrency.code, this.selectedAccount!.currency.code, amount).subscribe((result) => {
            this.convertedAmount = result.result || null;
        });
    }

    onSubmit(): void {
        if (this.newTransactionForm.valid && this.selectedAccount && this.userId) {
            const newTransactionRequest = {
                fromAccountId: this.selectedAccount._id!,
                toAccountNumber: this.newTransactionForm.get('toAccountNumber')?.value,
                amount: this.newTransactionForm.get('amount')?.value,
                currencyFrom: this.newTransactionForm.get('currency')?.value.code,
                categoryId: this.newTransactionForm.get('category')?.value._id,
            };

            this.transactionsService.coreTransactionsPost(newTransactionRequest).subscribe({
                next: (_) => {
                    this.snackBar.open('Transaction successfuly initiated!', 'Close', {
                        duration: 3000,
                        verticalPosition: 'top',
                    });
                    this.newTransactionForm.reset();
                    this.convertedAmount = null;
                },
            });
        }
    }
}
