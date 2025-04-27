import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { TransactionsService } from '../../../generated/core-api/api/transactions.service';
import { CategoriesService } from '../../../generated/core-api/api/categories.service';
import { Transaction, TransactionStatusEnum } from '../../../generated/core-api/model/transaction';
import { Category } from '../../../generated/core-api/model/category';
import { forkJoin } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-transaction-details',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatSelectModule, MatIconModule, MatButtonModule, MatSnackBarModule],
    templateUrl: './transaction-details.component.html',
    styleUrl: './transaction-details.component.less',
})
export class TransactionDetailsComponent implements OnInit {
    transactionId!: string;
    userId!: string;

    transaction?: Transaction;
    form!: FormGroup;
    categories: Category[] = [];

    constructor(
        private transactionsService: TransactionsService,
        private categoriesService: CategoriesService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar,
        private location: Location,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.userId = this.route.snapshot.paramMap.get('userId')!;
        this.transactionId = this.route.snapshot.paramMap.get('transactionId')!;
        this.form = this.fb.group({
            amount: '',
            category: {} as Category,
        });
        this.loadTransactionAndCategories();
    }

    get isPending(): boolean {
        return this.transaction?.status === TransactionStatusEnum.PENDING;
    }

    onSave() {
        if (this.transaction && this.isPending) {
            const updatedTransaction = {
                ...this.transaction,
                amount: this.form.value.amount || this.transaction.amount,
                category: this.form.value.category?._id || this.transaction.category?._id,
            };

            this.transactionsService.coreTransactionsUserIdTransactionIdPut(this.userId, this.transactionId, updatedTransaction).subscribe({
                next: () => {
                    this.snackBar.open('Transaction updated successfully', 'Close', {
                        duration: 3000,
                    });
                    this.loadTransactionAndCategories();
                },
            });
        }
    }

    onDelete() {
        if (this.transaction && this.isPending && confirm('Are you sure you want to cancel this transaction?')) {
            this.transactionsService.coreTransactionsUserIdTransactionIdDelete(this.userId, this.transactionId).subscribe((_) => {
                this.snackBar.open('Transaction cancelled successfully', 'Close', {
                    duration: 3000,
                });
            });
            this.goBack();
        }
    }

    goBack() {
        this.location.back();
    }

    private loadTransactionAndCategories() {
        forkJoin({
            transaction: this.transactionsService.coreTransactionsUserIdTransactionIdGet(this.userId, this.transactionId),
            categories: this.categoriesService.coreCategoriesGet(),
        }).subscribe({
            next: ({ transaction, categories }) => {
                this.transaction = transaction;
                this.categories = categories;
                if (this.isPending) {
                    const category = categories.find((c) => c._id === transaction.category?._id);
                    this.form.patchValue({
                        amount: transaction.amount,
                        category: category || ({} as Category),
                    });
                }
            },
        });
    }
}
