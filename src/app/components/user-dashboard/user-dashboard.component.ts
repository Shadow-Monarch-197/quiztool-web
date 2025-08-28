
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent {
  constructor(private auth: AuthService, private router: Router) {}
  logout() {                                  // NEW
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

