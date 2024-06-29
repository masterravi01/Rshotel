import { Component } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { CrudService } from '../../../core/services/crud.service';
import { APIConstant } from '../../../core/constants/APIConstant';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../core/services/alert.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register-user',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register-user.component.html',
  styleUrls: ['./register-user.component.css'],
})
export class RegisterUserComponent {
  userForm = this.formBuilder.group(
    {
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['USER', Validators.required],
      password: [
        '',
        [Validators.required, Validators.minLength(8), this.passwordValidator],
      ],
      confirmpassword: ['', Validators.required],
    },
    { validator: this.passwordMatchValidator }
  );

  constructor(
    private formBuilder: FormBuilder,
    private crudService: CrudService,
    private alertService: AlertService,
    private router: Router
  ) {}

  onSubmit() {
    console.log(this.userForm.value);
    if (this.userForm.valid) {
      const obj = JSON.parse(JSON.stringify(this.userForm.value));
      this.crudService
        .post(APIConstant.REGISTER_USER, obj)
        .then((response: any) => {
          console.log(response);
          this.alertService.successAlert(response.message);
          this.router.navigate(['/login']);
        })
        .catch((error) => {
          console.error('There was an error!', error);
          this.alertService.errorAlert(error.message);
        });
    }
  }

  passwordMatchValidator(form: any) {
    return form.controls['password'].value ===
      form.controls['confirmpassword'].value
      ? null
      : { mismatch: true };
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(value);

    const passwordValid =
      hasUpperCase && hasLowerCase && hasNumeric && hasSpecialCharacter;

    return !passwordValid ? { passwordStrength: true } : null;
  }
}
