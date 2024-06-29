import { Component, OnInit } from '@angular/core';
import { APIConstant } from '../../../core/constants/APIConstant';
import { AuthService } from '../../../core/services/auth.service';
import { CrudService } from '../../../core/services/crud.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  userInfo: any;
  constructor(
    private authService: AuthService,
    private crudService: CrudService
  ) {}
  ngOnInit(): void {
    const u = this.authService.getUserInfo();

    this.userInfo = u?.user;
    console.log(this.userInfo);
    this.crudService
      .post(APIConstant.GET_USER)
      .then((response: any) => {
        console.log(response);
      })
      .catch((error) => {
        console.error('There was an error!', error);
      });
  }
}
