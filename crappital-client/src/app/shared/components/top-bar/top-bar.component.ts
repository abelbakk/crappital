import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../../generated/core-api/api/auth.service';
import { UserInfo } from '../../../generated/core-api/model/user-info';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-top-bar',
    standalone: true,
    imports: [MatIconModule, MatButtonModule, MatToolbarModule, RouterModule],
    templateUrl: './top-bar.component.html',
    styleUrl: './top-bar.component.less',
})
export class TopBarComponent implements OnInit {
    isLoggedIn = false;
    userInfo?: UserInfo;

    constructor(
        private authService: AuthService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.checkAuthStatus();
    }

    private checkAuthStatus() {
        this.authService.coreAuthStatusGet().subscribe({
            next: (userInfo) => {
                this.isLoggedIn = true;
                this.userInfo = userInfo;
            },
            error: () => {
                this.isLoggedIn = false;
                this.userInfo = undefined;
            },
        });
    }

    logout() {
        this.authService.coreAuthSessionDelete().subscribe({
            next: () => {
                this.isLoggedIn = false;
                this.userInfo = undefined;
            },
        });
    }

    navigate(to: string) {
        this.router.navigateByUrl(to);
    }
}
