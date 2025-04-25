import { Component, OnInit } from '@angular/core';
import { AuthService, UserInfo, UsersService } from '../generated/core-api';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule],
    templateUrl: './profile.component.html',
    styleUrl: './profile.component.less',
})
export class ProfileComponent implements OnInit {
    currentUser: UserInfo | null = null;
    profileForm!: FormGroup;

    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private fb: FormBuilder,
        private router: Router,
    ) {
        this.profileForm = this.fb.group(
            {
                email: ['', [Validators.email]],
                firstName: [''],
                lastName: [''],
                phone: ['', [Validators.pattern(/^\+?[0-9]{7,15}$/)]],
                country: [''],
                postalCode: ['', [Validators.pattern(/^[0-9]+$/)]],
                county: [''],
                city: [''],
                street: [''],
                number: [''],
                additionalDetails: [''],
                newPassword: ['', [Validators.minLength(8)]],
                confirmPassword: [''],
            },
            { validators: this.passwordMatchValidator },
        );
    }

    ngOnInit(): void {
        this.authService.coreAuthStatusGet().subscribe((userInfo) => {
            if (userInfo._id) {
                this.usersService.coreUsersIdGet(userInfo._id).subscribe((user) => {
                    this.currentUser = user;
                    this.profileForm.patchValue({
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        phone: user.phone || '',
                        country: user.address.country,
                        postalCode: user.address.postalCode,
                        county: user.address.county,
                        city: user.address.city,
                        street: user.address.street,
                        number: user.address.number,
                        additionalDetails: user.address.additionalDetails || '',
                    });
                });
            }
        });
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;

        return password === confirmPassword ? null : { passwordMismatch: true };
    }

    getErrorMessage(controlName: string): string {
        const control = this.profileForm.get(controlName);
        if (control?.hasError('required')) {
            return 'This field is required';
        }
        if (control?.hasError('email')) {
            return 'Please enter a valid email address';
        }
        if (control?.hasError('pattern')) {
            if (controlName === 'phone') {
                return 'Please enter a valid phone number';
            }
            if (controlName === 'postalCode') {
                return 'Please enter a valid postal code';
            }
        }
        if (this.profileForm.hasError('passwordMismatch') && (controlName === 'newPassword' || controlName === 'confirmPassword')) {
            return 'Passwords do not match';
        }
        return '';
    }

    onSave() {
        if (this.currentUser?._id) {
            const formValue = this.profileForm.value;
            const userData = {
                email: formValue.email,
                firstName: formValue.firstName,
                lastName: formValue.lastName,
                phone: formValue.phone || undefined,
                address: {
                    country: formValue.country,
                    postalCode: formValue.postalCode,
                    county: formValue.county,
                    city: formValue.city,
                    street: formValue.street,
                    number: formValue.number,
                    additionalDetails: formValue.additionalDetails || undefined,
                },
                password: formValue.newPassword || undefined,
            };

            this.usersService.coreUsersIdPut(this.currentUser._id, userData).subscribe(() => {
                this.profileForm.get('newPassword')?.reset();
                this.profileForm.get('confirmPassword')?.reset();
                this.authService.coreAuthStatusGet().subscribe((userInfo) => {
                    if (userInfo._id) {
                        this.usersService.coreUsersIdGet(userInfo._id).subscribe((user) => {
                            this.currentUser = user;
                            this.profileForm.patchValue({
                                email: user.email,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                phone: user.phone || '',
                                country: user.address.country,
                                postalCode: user.address.postalCode,
                                county: user.address.county,
                                city: user.address.city,
                                street: user.address.street,
                                number: user.address.number,
                                additionalDetails: user.address.additionalDetails || '',
                            });
                        });
                    }
                });
            });
        }
    }

    onDelete() {
        if (this.currentUser?._id && confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            this.usersService.coreUsersIdDelete(this.currentUser._id).subscribe(() => {
                this.router.navigate(['/home']);
            });
        }
    }
}
