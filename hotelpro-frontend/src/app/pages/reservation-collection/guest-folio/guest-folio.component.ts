import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';
import { CrudService } from '../../../core/services/crud.service';
import { APIConstant } from '../../../core/constants/APIConstant';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  JsonPipe,
} from '@angular/common';
import { NgImageSliderModule } from 'ng-image-slider-v17';
import { AuthService } from '../../../core/services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-guest-folio',
  standalone: true,
  imports: [
    JsonPipe,
    DatePipe,
    CurrencyPipe,
    CommonModule,
    NgImageSliderModule,
    FormsModule,
  ],
  templateUrl: './guest-folio.component.html',
  styleUrl: './guest-folio.component.css',
})
export class GuestFolioComponent implements OnInit {
  groupDetails: any;
  propertyUnitId: string | null = '';
  groupId: string | null = '';
  updateStayArrival: string = '';
  updateStayDeparture: string = '';
  imageObject = [
    {
      image:
        'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      thumbImage:
        'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      image:
        'https://media.istockphoto.com/id/1390233984/photo/modern-luxury-bedroom.jpg?s=612x612&w=0&k=20&c=po91poqYoQTbHUpO1LD1HcxCFZVpRG-loAMWZT7YRe4=',
      thumbImage:
        'https://media.istockphoto.com/id/1390233984/photo/modern-luxury-bedroom.jpg?s=612x612&w=0&k=20&c=po91poqYoQTbHUpO1LD1HcxCFZVpRG-loAMWZT7YRe4=',
    },
    {
      image:
        'https://assets.architecturaldigest.in/photos/60084dd6cce5700439e12bf7/16:9/w_2560%2Cc_limit/modern-living-room-decor-1366x768.jpg',
      thumbImage:
        'https://assets.architecturaldigest.in/photos/60084dd6cce5700439e12bf7/16:9/w_2560%2Cc_limit/modern-living-room-decor-1366x768.jpg',
      title: 'Example with title.',
    },
  ];
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private authService: AuthService,
    private crudService: CrudService,
    private modalService: NgbModal
  ) {}
  ngOnInit(): void {
    this.propertyUnitId = this.authService.getUserInfo()?.user?.propertyUnitId;
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    if (this.groupId) {
      this.crudService
        .post(APIConstant.GUEST_FOLIO, { groupId: this.groupId })
        .then((response) => {
          console.log(response);
          this.groupDetails = response.data;
        })
        .catch((error) => {
          this.alertService.errorAlert(
            error?.error?.message ||
              'An error occurred while processing payment'
          );
          console.error(error);
        });
    }
  }

  updateStay(reservationId: any) {
    this.crudService
      .post(APIConstant.STAY_UPDATE, {
        reservationId: reservationId,
        propertyUnitId: this.propertyUnitId,
        groupId: this.groupId,
        assigncheckindate: new Date(this.updateStayArrival),
        assigncheckoutdate: new Date(this.updateStayDeparture),
      })
      .then((response) => {
        console.log(response);
        this.alertService.successAlert(response.message);
        this.ngOnInit();
      })
      .catch((error) => {
        this.alertService.errorAlert(
          error?.error?.message || 'An error occurred while processing payment'
        );
        console.error(error);
      });
  }
  private formatDate(date: Date): string {
    return new DatePipe('en-US').transform(date, 'yyyy-MM-dd') || '';
  }
  openUpdateStayModal(reservation: any, content: any): void {
    this.updateStayArrival = this.formatDate(new Date(reservation.arrival));
    this.updateStayDeparture = this.formatDate(new Date(reservation.departure));
    this.modalService.open(content).result.then((result) => {
      if (result) {
        this.updateStay(reservation._id);
      }
    });
  }
}
