import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';

import { AuthService } from '../../../core/services/auth.service';
import { CrudService } from '../../../core/services/crud.service';
import { APIConstant } from '../../../core/constants/APIConstant';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-frontdesk-dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './frontdesk-dashboard.component.html',
  styleUrl: './frontdesk-dashboard.component.css',
})
export class FrontdeskDashboardComponent {
  userInfo: any;
  availabilityData: any;
  constructor(
    private authService: AuthService,
    private router: Router,
    private crudService: CrudService,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo()?.user;
    console.log(this.userInfo);

    this.fetchData();
  }

  fetchData() {
    let startDate = new Date();
    let endDate = new Date();
    endDate.setDate(endDate.getDate() + 6);
    this.crudService
      .post(APIConstant.READ_FUTURE_AVAILABILITY, {
        propertyUnitId: this.userInfo.propertyUnitId,
        startDate,
        endDate,
      })
      .then((response: any) => {
        this.availabilityData = response.data;
        console.log(this.availabilityData);
      })
      .catch((error) => {
        this.alertService.errorAlert(error?.error?.message || error.message);
      });
  }
}
