import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CrudService } from '../../../core/services/crud.service';
import { CustomValidators } from '../../../core/shared/validators/custom-validators';
import { AlertService } from '../../../core/services/alert.service';
import { ActivatedRoute, Router } from '@angular/router';
import { APIConstant } from '../../../core/constants/APIConstant';

@Component({
  selector: 'app-room-type-setup',
  templateUrl: './room-type-setup.component.html',
  styleUrls: ['./room-type-setup.component.css'],
})
export class RoomTypeSetupComponent implements OnInit {
  userInfo: any;
  roomTypeForm!: FormGroup;
  propertyUnitId: string | null = '';

  constructor(
    private authService: AuthService,
    private crudService: CrudService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo()?.user;
    this.propertyUnitId =
      this.activeRoute.snapshot.paramMap.get('propertyUnitId');

    this.roomTypeForm = this.fb.group({
      roomTypes: this.fb.array([this.createRoomType()]),
    });

    this.crudService
      .post(APIConstant.READ_ROOMTYPES + this.propertyUnitId, {})
      .then((response: any) => {
        console.log(response);
        this.alertService.successAlert(response.message);
        // this.roomTypeForm.reset(response.data);
      })
      .catch((error) => {
        this.alertService.errorAlert(error.message);
      });
  }

  get roomTypes(): FormArray {
    return this.roomTypeForm.get('roomTypes') as FormArray;
  }

  createRoomType(): FormGroup {
    return this.fb.group({
      roomTypeName: [
        '',
        [Validators.required, CustomValidators.noLeadingSpace],
      ],
      roomTypeCategory: ['', [Validators.required]],
      active: [false, [Validators.required]],
      description: ['', [Validators.required]],
      adultOccupancy: [2, [Validators.required]],
      childOccupancy: [2, [Validators.required]],
    });
  }

  addRoomType(): void {
    this.roomTypes.push(this.createRoomType());
  }

  onSubmit(): void {
    console.log(this.roomTypeForm.value);
    if (this.roomTypeForm.valid) {
      this.crudService
        .post(
          APIConstant.ADD_ROOMTYPES + this.propertyUnitId,
          this.roomTypeForm.value
        )
        .then((response: any) => {
          console.log(response);
          this.alertService.successAlert(response.message);
        })
        .catch((error) => {
          this.alertService.errorAlert(error.message);
        });
    } else {
      this.roomTypeForm.markAllAsTouched();
    }
    // Handle form submission, e.g., send data to server
  }
}
