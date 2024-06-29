import { Component, TemplateRef } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../core/services/crud.service';
import { APIConstant } from '../../core/constants/APIConstant';
import { AlertService } from '../../core/services/alert.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  oldPassword: string = '';
  newPassword: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private crudService: CrudService,
    private alertService: AlertService,
    private modalService: NgbModal
  ) {}

  async logOut() {
    try {
      await this.authService.logout();
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed', error);
    }
  }
  openChangePassword(content: TemplateRef<any>) {
    this.modalService.open(content).result.then((result) => {
      if (result) {
        this.changePassWord({
          newPassword: this.newPassword,
          oldPassword: this.oldPassword,
        });
      } else {
        this.newPassword = '';
        this.oldPassword = '';
      }
    });
  }
  changePassWord(obj: any) {
    this.crudService
      .post(APIConstant.CHANGE_PASSWORD, obj)
      .then((response: any) => {
        console.log(response);
        this.alertService.successAlert(response.message);
        this.newPassword = '';
        this.oldPassword = '';
      })
      .catch((error) => {
        console.error('There was an error!', error);
        this.alertService.errorAlert(error.message);
      });
  }
  passwordValidator() {
    const value = this.newPassword;
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
