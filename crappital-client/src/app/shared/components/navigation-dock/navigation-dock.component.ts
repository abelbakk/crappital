import { Component } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs';
import { AuthService } from '../../../generated/core-api';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-navigation-dock',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatTooltipModule, RouterModule],
    templateUrl: './navigation-dock.component.html',
    styleUrls: ['./navigation-dock.component.less'],
})
export class NavigationDockComponent {
    isLoggedIn = false;
    isAdmin = false;

    navItems = [
        { label: 'Dashboard', icon: 'analytics', route: '/dashboard' },
        { label: 'New Account', icon: 'add_business', route: '/new-account' },
        { label: 'Deposit', icon: 'local_atm', route: '/deposit' },
        { label: 'Accounts', icon: 'account_balance', route: '/accounts' },
        { label: 'New Transaction', icon: 'payments', route: '/new-transaction' },
        { label: 'Admin Dashboard', icon: 'admin_panel_settings', route: '/admin-dashboard', admin: true },
        { label: 'Profile', icon: 'person', route: '/profile' },
    ];

    constructor(
        private authService: AuthService,
        public router: Router,
    ) {
        this.checkAuthStatus();
        this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
            this.checkAuthStatus();
        });
    }

    private checkAuthStatus() {
        this.authService.coreAuthStatusGet().subscribe({
            next: (userInfo) => {
                this.isLoggedIn = true;
                this.isAdmin = !!userInfo?.admin;
            },
            error: () => {
                this.isLoggedIn = false;
                this.isAdmin = false;
            },
        });
    }

    isActive(route: string): boolean {
        return this.router.url.startsWith(route);
    }
}
