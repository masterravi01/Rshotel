import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public isAuth = new BehaviorSubject<boolean>(false);

  constructor(private router: Router) {
    this.autoLogIn();
  }

  autoLogIn() {
    if (localStorage.getItem('email')) {
      this.isAuth.next(true);
      this.router.navigate(['/dashboard']);
    }
  }

  logIn(email: string) {
    localStorage.setItem('email', email);
    this.isAuth.next(true);
    this.router.navigate(['/dashboard']);
  }

  logOut() {
    localStorage.removeItem('email');
    this.isAuth.next(false);
    this.router.navigate(['/login']);
  }
}
