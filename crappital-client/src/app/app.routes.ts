import { Routes } from '@angular/router';
import { authGuard, authGuardAdmin } from './shared/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    {
        path: 'home',
        loadComponent: () => import('./home/home.component').then((c) => c.HomeComponent),
    },
    {
        path: 'login',
        loadComponent: () => import('./login/login.component').then((c) => c.LoginComponent),
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then((c) => c.DashboardComponent),
        canActivate: [authGuard],
    },
    {
        path: 'profile',
        loadComponent: () => import('./profile/profile.component').then((c) => c.ProfileComponent),
        canActivate: [authGuard],
    },
    {
        path: 'deposit',
        loadComponent: () => import('./deposit/deposit.component').then((c) => c.DepositComponent),
        canActivate: [authGuard],
    },
    {
        path: 'accounts',
        loadComponent: () => import('./accounts/accounts.component').then((c) => c.AccountsComponent),
        canActivate: [authGuard],
    },
    {
        path: 'accounts/:userId/:accountId',
        loadComponent: () => import('./accounts/account-details/account-details.component').then((c) => c.AccountDetailsComponent),
        canActivate: [authGuard],
    },
    {
        path: 'transactions/:userId/:transactionId',
        loadComponent: () => import('./accounts/account-details/transaction-details/transaction-details.component').then((c) => c.TransactionDetailsComponent),
        canActivate: [authGuard],
    },
    {
        path: 'new-transaction',
        loadComponent: () => import('./new-transaction/new-transaction.component').then((c) => c.NewTransactionComponent),
        canActivate: [authGuard],
    },
    {
        path: 'admin-dashboard',
        loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then((c) => c.AdminDashboardComponent),
        canActivate: [authGuardAdmin],
    },
    { path: '**', redirectTo: 'home' },
];
