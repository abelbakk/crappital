import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', loadComponent: () => import('./home/home.component').then((c) => c.HomeComponent) },
    { path: 'login', loadComponent: () => import('./login/login.component').then((c) => c.LoginComponent) },
    { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then((c) => c.DashboardComponent), canActivate: [authGuard] },
    { path: '**', redirectTo: 'home' },
];
