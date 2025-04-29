import { Component, OnInit } from '@angular/core';
import { AccountsService, AuthService, UserInfo, CurrencyInfo } from '../generated/core-api';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CurrencyPickerComponent } from '../shared/components/currency-picker/currency-picker.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-new-account',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, CurrencyPickerComponent, MatSnackBarModule],
    templateUrl: './new-account.component.html',
    styleUrl: './new-account.component.less',
})
export class NewAccountComponent implements OnInit {
    currentUser: UserInfo | null = null;
    newAccountForm!: FormGroup;

    constructor(
        private authService: AuthService,
        private accountsService: AccountsService,
        private fb: FormBuilder,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.authService.coreAuthStatusGet().subscribe((userInfo) => {
            this.currentUser = userInfo;
        });
        this.newAccountForm = this.fb.group({
            name: ['', Validators.required],
            currency: [null, Validators.required],
        });
    }

    onSubmit(): void {
        if (this.newAccountForm.valid && this.currentUser?._id) {
            const newAccountRequest = {
                userId: this.currentUser._id,
                name: this.newAccountForm.get('name')?.value,
                currency: this.newAccountForm.get('currency')?.value.code,
            };

            this.accountsService.coreAccountsPost(newAccountRequest).subscribe({
                next: () => {
                    this.newAccountForm.reset();
                    this.router.navigateByUrl('/dashboard');
                },
            });
        }
    }
}
