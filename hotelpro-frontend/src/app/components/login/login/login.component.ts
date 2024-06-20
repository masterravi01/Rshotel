import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginInForm = new FormGroup({
    email: new FormControl<string>('', [Validators.required]),
    password: new FormControl<string>('', [Validators.required]),
  });

  constructor(private authService: AuthService) {}

  logIn() {
    if (this.loginInForm.valid) {
      this.authService.logIn(this.loginInForm.value).subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => console.log(err.message),
      });
    }
  }
}
