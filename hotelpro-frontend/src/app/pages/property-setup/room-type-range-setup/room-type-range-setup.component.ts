import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { APIConstant } from '../../../core/constants/APIConstant';
import { AlertService } from '../../../core/services/alert.service';
import { CrudService } from '../../../core/services/crud.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-room-type-range-setup',
  templateUrl: './room-type-range-setup.component.html',
  styleUrls: ['./room-type-range-setup.component.css'],
})
export class RoomTypeRangeSetupComponent implements OnInit {
  roomTypeForm!: FormGroup;
  propertyUnitId: string | null = '';
  roomTypeId: string | null = 'ADD';

  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.propertyUnitId =
      this.activeRoute.snapshot.paramMap.get('propertyUnitId');
    this.roomTypeId = this.activeRoute.snapshot.paramMap.get('roomTypeId');

    this.roomTypeForm = this.fb.group(
      {
        roomTypeName: ['', Validators.required],
        active: [false],
        roomTypeCategory: ['Room', Validators.required],
        description: ['', Validators.required],
        adultOccupancy: [0, [Validators.min(1), Validators.required]],
        childOccupancy: [0, Validators.required],
        rooms: this.fb.array([]),
      },
      { validators: [this.totalRoomsValidator(), this.noOverlappingRanges()] }
    );

    if (this.roomTypeId && this.roomTypeId != 'ADD') {
      this.crudService
        .post(APIConstant.READ_ROOMTYPE_BY_ID + this.roomTypeId)
        .then((response: any) => {
          console.log(response);
          this.roomTypeForm.reset(response.data);
          this.alertService.successAlert(response.message);
        })
        .catch((error: any) => {
          this.alertService.errorAlert(error.message);
          this.router.navigate([
            '/property-setup/roomtyperangesetup/' +
              this.propertyUnitId +
              '/ADD',
          ]);
          this.ngOnInit();
        });
    } else {
      this.roomTypeForm.addControl(
        'totalrooms',
        this.fb.control(0, [Validators.min(1), Validators.required])
      );
    }
  }

  get rooms(): FormArray {
    return this.roomTypeForm.get('rooms') as FormArray;
  }

  createRoomGroup(data?: any): FormGroup {
    return this.fb.group({
      prefix: [data?.prefix || ''],
      start: [data?.start || '', Validators.required],
      end: [data?.end || '', Validators.required],
    });
  }

  addRoom(data?: any) {
    this.rooms.push(this.createRoomGroup(data));
  }

  onSubmit() {
    if (this.roomTypeForm.valid) {
      console.log(this.roomTypeForm.value);
      // Handle the form submission logic here

      if (this.roomTypeId == 'ADD') {
        this.crudService
          .post(
            APIConstant.CREATE_ROOMTYPE_AND_ROOMS + this.propertyUnitId,
            this.roomTypeForm.value
          )
          .then((response: any) => {
            console.log(response);
            this.alertService.successAlert(response.message);
            this.router.navigate([
              '/property-setup/roomsreview/' + this.propertyUnitId,
            ]);
          })
          .catch((error: any) => {
            this.alertService.errorAlert(error.message);
          });
      } else {
        this.crudService
          .post(
            APIConstant.UPDATE_ROOM_TYPE + this.roomTypeId,
            this.roomTypeForm.value
          )
          .then((response: any) => {
            console.log(response);
            this.alertService.successAlert(response.message);
            this.router.navigate([
              '/property-setup/roomsreview/' + this.propertyUnitId,
            ]);
          })
          .catch((error: any) => {
            this.alertService.errorAlert(error.message);
          });
      }
    } else {
      console.error('Form is invalid');
    }
  }

  removeRoom(index: number) {
    this.rooms.removeAt(index);
  }

  totalRoomsValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const totalRooms = control.get('totalrooms')?.value;
      const roomsArray = control.get('rooms') as FormArray;

      if (!totalRooms || !roomsArray) {
        return null;
      }

      let roomCount = 0;

      roomsArray.controls.forEach((roomGroup) => {
        const start = parseInt(roomGroup.get('start')?.value, 10);
        const end = parseInt(roomGroup.get('end')?.value, 10);
        if (start && end) {
          roomCount += end - start + 1;
        }
      });

      return roomCount === totalRooms ? null : { totalRoomsMismatch: true };
    };
  }

  noOverlappingRanges(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const roomsArray = control.get('rooms') as FormArray;

      if (!roomsArray) {
        return null;
      }

      const ranges: { start: number; end: number }[] = [];

      let hasOverlap = false;

      roomsArray.controls.forEach((roomGroup) => {
        const start = parseInt(roomGroup.get('start')?.value, 10);
        const end = parseInt(roomGroup.get('end')?.value, 10);

        if (start && end) {
          for (let range of ranges) {
            if (
              (start >= range.start && start <= range.end) ||
              (end >= range.start && end <= range.end) ||
              (start <= range.start && end >= range.end)
            ) {
              hasOverlap = true;
              break;
            }
          }

          ranges.push({ start, end });
        }
      });

      return hasOverlap ? { overlappingRanges: true } : null;
    };
  }
}
