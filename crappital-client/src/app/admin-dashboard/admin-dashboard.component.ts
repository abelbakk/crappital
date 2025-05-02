import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, Transaction, TransactionStatusEnum, UserInfo, CategoriesService, Category } from '../generated/core-api';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule, MatSnackBarModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.less',
})
export class AdminDashboardComponent implements OnInit {
    unapprovedUsers: UserInfo[] = [];
    pendingTransactions: Transaction[] = [];
    users: UserInfo[] = [];
    categories: Category[] = [];
    categoryIcons: string[] = [
        '💸',
        '🍔',
        '🚗',
        '🏠',
        '🎉',
        '🛒',
        '✈️',
        '📚',
        '💡',
        '🏥',
        '🎮',
        '🐾',
        '🧾',
        '🛠️',
        '🎁',
        '🧃',
        '🧘',
        '🧹',
        '🧺',
        '🛏️',
        '💻',
        '📱',
        '⌚',
        '🎧',
        '🎤',
        '🎹',
        '🎸',
        '🎺',
        '🎻',
        '🥁',
        '⚽',
        '🏀',
        '🏈',
        '⚾',
        '🎾',
        '🏐',
        '🏉',
        '🎱',
        '🏓',
        '🏸',
        '🥅',
        '🏒',
        '🏑',
        '🏏',
        '⛳',
        '🏹',
        '🎣',
        '🥊',
        '🥋',
        '⛸️',
        '🎿',
        '⛷️',
        '🏂',
        '🏋️',
        '🤸',
        '🤺',
        '🤼',
        '🤽',
        '🤾',
        '🧗',
        '🚵',
        '🚴',
        '🏆',
        '🏅',
        '🥇',
        '🥈',
        '🥉',
        '🎖️',
        '🏵️',
        '🎗️',
        '🎫',
        '🎟️',
        '🎭',
        '🎨',
        '🎬',
        '🎤',
        '🎧',
        '🎼',
        '🎹',
        '🥁',
        '🎷',
        '🎺',
        '🎸',
        '🎻',
        '🎬',
        '🎮',
        '🎯',
        '🎲',
        '🎰',
        '🎳',
    ];
    newCategory: Category = { name: '', icon: '💸' };
    editingCategoryId: string | null = null;
    editingCategory: Category = { name: '', icon: '💸' };
    categoryForm: FormGroup;
    editCategoryForm: FormGroup;

    constructor(
        private adminService: AdminService,
        private snackBar: MatSnackBar,
        private categoriesService: CategoriesService,
        private fb: FormBuilder,
    ) {
        this.categoryForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(32)]],
            icon: [this.categoryIcons[0], Validators.required],
        });
        this.editCategoryForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(32)]],
            icon: [this.categoryIcons[0], Validators.required],
        });
    }

    ngOnInit(): void {
        this.loadUnapprovedUsers();
        this.loadPendingTransactions();
        this.loadUsers();
        this.loadCategories();
    }

    loadUsers(): void {
        this.adminService.coreAdminUsersGet().subscribe({
            next: (users) => {
                this.users = users;
            },
        });
    }

    loadUnapprovedUsers(): void {
        this.adminService.coreAdminUsersUnapprovedGet().subscribe({
            next: (users) => {
                this.unapprovedUsers = users;
            },
        });
    }

    loadPendingTransactions(): void {
        this.adminService.coreAdminTransactionsPendingGet().subscribe({
            next: (transactions) => {
                this.pendingTransactions = transactions;
            },
        });
    }

    approveTransaction(transaction: Transaction): void {
        if (transaction._id) {
            this.adminService.coreAdminTransactionsTransactionIdApprovePut(transaction._id).subscribe({
                next: () => {
                    this.snackBar.open('Transaction approved successfully', 'Close', {
                        duration: 3000,
                        verticalPosition: 'top',
                    });
                    this.loadPendingTransactions();
                },
            });
        }
    }

    rejectTransaction(transaction: Transaction): void {
        if (transaction._id) {
            this.adminService.coreAdminTransactionsTransactionIdRejectPut(transaction._id).subscribe({
                next: () => {
                    this.snackBar.open('Transaction rejected successfully', 'Close', {
                        duration: 3000,
                        verticalPosition: 'top',
                    });
                    this.loadPendingTransactions();
                },
            });
        }
    }

    loadCategories(): void {
        this.categoriesService.coreCategoriesGet().subscribe({
            next: (categories) => {
                this.categories = categories;
            },
        });
    }

    addCategory(): void {
        if (this.categoryForm.valid) {
            const newCategory: Category = this.categoryForm.value;
            this.categoriesService.coreCategoriesPost(newCategory).subscribe({
                next: () => {
                    this.snackBar.open('Category added', 'Close', { duration: 2000, verticalPosition: 'top' });
                    this.categoryForm.reset({ name: '', icon: this.categoryIcons[0] });
                    this.loadCategories();
                },
            });
        }
    }

    startEditCategory(category: Category): void {
        this.editingCategoryId = category._id || null;
        this.editCategoryForm.setValue({ name: category.name, icon: category.icon });
    }

    saveEditCategory(category: Category): void {
        if (this.editCategoryForm.valid) {
            const updatedCategory: Category = this.editCategoryForm.value;
            this.categoriesService.coreCategoriesNamePut(category.name, updatedCategory).subscribe({
                next: () => {
                    this.snackBar.open('Category updated', 'Close', { duration: 3000, verticalPosition: 'top' });
                    this.editingCategoryId = null;
                    this.editCategoryForm.reset({ name: '', icon: this.categoryIcons[0] });
                    this.loadCategories();
                },
            });
        }
    }

    cancelEditCategory(): void {
        this.editingCategoryId = null;
        this.editCategoryForm.reset({ name: '', icon: this.categoryIcons[0] });
    }

    deleteCategory(category: Category): void {
        this.categoriesService.coreCategoriesNameDelete(category.name).subscribe({
            next: () => {
                this.snackBar.open('Category deleted', 'Close', { duration: 3000, verticalPosition: 'top' });
                this.loadCategories();
            },
        });
    }
}
