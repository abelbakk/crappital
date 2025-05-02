import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, UserInfo } from '../generated/core-api';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
    templateUrl: './admin-dashboard.component.html',
    styleUrl: './admin-dashboard.component.less',
})
export class AdminDashboardComponent implements OnInit {
    unapprovedUsers: UserInfo[] = [];

    constructor(private adminService: AdminService) {}

    ngOnInit(): void {
        this.loadUnapprovedUsers();
    }

    loadUnapprovedUsers(): void {
        this.adminService.coreAdminUsersUnapprovedGet().subscribe({
            next: (users) => {
                this.unapprovedUsers = users;
            },
            error: (error) => {
                console.error('Error fetching unapproved users', error);
            },
        });
    }
}
