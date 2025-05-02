import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, Transaction, TransactionStatusEnum, UserInfo } from '../generated/core-api';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule, MatSnackBarModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.less',
})
export class AdminDashboardComponent implements OnInit {
    unapprovedUsers: UserInfo[] = [];
    pendingTransactions: Transaction[] = [];
    users: UserInfo[] = [];

    constructor(
        private adminService: AdminService,
        private snackBar: MatSnackBar,
    ) {}

    ngOnInit(): void {
        this.loadUnapprovedUsers();
        this.loadPendingTransactions();
        this.loadUsers();
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
}
