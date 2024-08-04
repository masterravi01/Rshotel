import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { CrudService } from '../../../core/services/crud.service';
import { APIConstant } from '../../../core/constants/APIConstant';
import { AlertService } from '../../../core/services/alert.service';


@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css'
})
export class ClientDashboardComponent {
  userInfo: any;
  propertyData: any;
  constructor(
    private authService: AuthService,
    private router: Router,
    private crudService: CrudService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo()?.user;
    console.log(this.userInfo);
    
    this.crudService
        .post(APIConstant.READ_CLIENT_DASHBOARD, {ClientId: this.userInfo._id})
        .then((response: any) => {
          console.log(response.data.property);
          this.propertyData = response.data.property;
        })
        .catch((error) => {
          this.alertService.errorAlert(error?.error?.message || error.message);
        });
    
  }
  
  addProperty() {
    this.router.navigate(['/property-setup/ADD']);
  }

}
