import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TopBarComponent } from './shared/components/top-bar/top-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationComponent } from "./shared/components/notification/notification.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, TopBarComponent, MatIconModule, MatButtonModule, NotificationComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.less',
})
export class AppComponent {
    title = 'crappital-client';

    constructor(public router: Router) {}
}
