import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../generated/core-api/api/auth.service';
import { UsersService } from '../generated/core-api/api/users.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.less',
})
export class LoginComponent implements OnInit {
    showSignup = false;
    loginForm!: FormGroup;
    signupForm!: FormGroup;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private usersService: UsersService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
        });
        this.signupForm = this.fb.group(
            {
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, Validators.minLength(8)]],
                confirmPassword: ['', [Validators.required]],
                firstName: ['', [Validators.required]],
                lastName: ['', [Validators.required]],
                phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)]],
                postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
                country: ['', [Validators.required]],
                county: ['', [Validators.required]],
                city: ['', [Validators.required]],
                street: ['', [Validators.required]],
                number: ['', [Validators.required]],
                additionalDetails: [''],
            },
            {
                validators: this.passwordMatchValidator,
            },
        );
    }

    toggleForm() {
        this.showSignup = !this.showSignup;
    }

    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password')?.value;
        const confirmPassword = control.get('confirmPassword')?.value;

        return password === confirmPassword ? null : { passwordMismatch: true };
    }

    onLogin() {
        if (this.loginForm.valid) {
            const { email, password } = this.loginForm.value;
            this.authService.coreAuthSessionPost({ email, password }).subscribe({
                next: () => this.router.navigate(['/dashboard']),
                error: (_) => {},
            });
        }
    }

    onSignup() {
        if (this.signupForm.valid) {
            const formValue = this.signupForm.value;
            const userData = {
                email: formValue.email,
                password: formValue.password,
                confirmPassword: formValue.confirmPassword,
                firstName: formValue.firstName,
                lastName: formValue.lastName,
                phone: formValue.phone,
                postalCode: formValue.postalCode,
                country: formValue.country,
                county: formValue.county,
                city: formValue.city,
                street: formValue.street,
                number: formValue.number,
                additionalDetails: formValue.additionalDetails || null,
            };
            this.usersService.coreUsersPost(userData).subscribe({
                next: () => {
                    this.authService
                        .coreAuthSessionPost({
                            email: userData.email,
                            password: userData.password,
                        })
                        .subscribe(() => this.router.navigate(['/dashboard']));
                },
                error: (_) => {},
            });
        }
    }

    getErrorMessage(form: FormGroup, controlName: string): string {
        const control = form.get(controlName);
        if (control?.hasError('required')) {
            return 'This field is required';
        }
        if (control?.hasError('email')) {
            return 'Please enter a valid email address';
        }
        if (control?.hasError('minlength')) {
            return 'Password must be at least 8 characters long';
        }
        if (control?.hasError('duplicateEmail')) {
            return 'This email is already registered';
        }
        if (this.loginForm.hasError('passwordMismatch') && (controlName === 'newPassword' || controlName === 'confirmPassword')) {
            return 'Passwords do not match';
        }
        return '';
    }
}
