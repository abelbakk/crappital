import { Component, OnInit } from '@angular/core';
import { AdminService, UserInfo } from '../../generated/core-api';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-user-info',
    imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatIconModule],
    templateUrl: './user-info.component.html',
    styleUrl: './user-info.component.less',
})
export class UserInfoComponent implements OnInit {
    userId!: string;
    userInfo: UserInfo | undefined;
    restrictForm!: FormGroup;

    constructor(
        private adminService: AdminService,
        private route: ActivatedRoute,
        private location: Location,
        private fb: FormBuilder,
    ) {
        this.restrictForm = this.fb.group({
            restrictDate: [new Date(), Validators.required],
        });
    }

    ngOnInit(): void {
        this.userId = this.route.snapshot.paramMap.get('userId')!;
        this.fetchUserInfo();
    }

    fetchUserInfo(): void {
        this.adminService.coreAdminUsersGet().subscribe((users) => {
            this.userInfo = users.find((user) => user._id === this.userId);
        });
    }

    onApprove(): void {
        if (this.userId) {
            this.adminService.coreAdminUsersUserIdApprovePut(this.userId).subscribe({
                next: () => {
                    this.fetchUserInfo();
                },
            });
        }
    }

    onRestrict(): void {
        if (this.userId) {
            const restrictDate = this.restrictForm.value.restrictDate;
            this.adminService.coreAdminUsersUserIdRestrictPut(this.userId, restrictDate).subscribe({
                next: () => {
                    this.fetchUserInfo();
                },
            });
        }
    }

    goBack() {
        this.location.back();
    }
}
