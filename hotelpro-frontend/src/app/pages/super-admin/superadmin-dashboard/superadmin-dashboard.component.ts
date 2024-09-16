import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { CrudService } from '../../../core/services/crud.service';
import { APIConstant } from '../../../core/constants/APIConstant';
import { AlertService } from '../../../core/services/alert.service';
import { UserInfoService } from '../../../core/services/user-info.service';


@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './superadmin-dashboard.component.html',
  styleUrl: './superadmin-dashboard.component.css',
})
export class SuperadminDashboardComponent {
  userInfo: any;
  dashboardData: any;
  constructor(
    private authService: AuthService,
    private userInfoService: UserInfoService,
    private router: Router,
    private crudService: CrudService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo()?.user;
    console.log(this.userInfo);

    if (this.userInfo?.userType != "superadmin") {
      this.authService.logout();
    }

    this.crudService
      .post(APIConstant.GET_SUPERADMIN_DASHBOARD, {})
      .then((response: any) => {
        this.dashboardData = response.data;
        console.log(this.dashboardData);
      })
      .catch((error) => {
        this.alertService.errorAlert(error?.error?.message || error.message);
      });
  }

  login(email: String) {
    this.crudService
      .post(APIConstant.CLIENT_LOGIN_BY_SUPERADMIN, { email })
      .then((response: any) => {
        let userData = response.data;
        this.userInfoService.setUserInfo(userData);
        this.router.navigate([`/client-dashboard`]);
      })
      .catch((error) => {
        this.alertService.errorAlert(error?.error?.message || error.message);
      });
  }
}
