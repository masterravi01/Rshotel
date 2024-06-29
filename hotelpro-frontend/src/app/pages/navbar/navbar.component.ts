import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  constructor(private authService: AuthService, private router: Router) {}

  async logOut() {
    try {
      await this.authService.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
}
