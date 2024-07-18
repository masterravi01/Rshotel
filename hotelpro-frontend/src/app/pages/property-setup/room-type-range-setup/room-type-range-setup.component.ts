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
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-room-type-range-setup',
  templateUrl: './room-type-range-setup.component.html',
  styleUrls: ['./room-type-range-setup.component.css'],
})
export class RoomTypeRangeSetupComponent implements OnInit {
  roomTypeForm!: FormGroup;
  propertyUnitId: string | null = '';

  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.propertyUnitId =
      this.activeRoute.snapshot.paramMap.get('propertyUnitId');

    this.roomTypeForm = this.fb.group(
      {
        roomTypeName: ['', Validators.required],
        active: [false],
        roomTypeCategory: ['Room', Validators.required],
        description: ['', Validators.required],
        adultOccupancy: [0, [Validators.min(1), Validators.required]],
        childOccupancy: [0, Validators.required],
        totalrooms: [0, [Validators.min(1), Validators.required]],
        rooms: this.fb.array([]),
      },
      { validators: [this.totalRoomsValidator(), this.noOverlappingRanges()] }
    );
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
      this.crudService
        .post(
          APIConstant.CREATE_ROOMTYPE_AND_ROOMS + this.propertyUnitId,
          this.roomTypeForm.value
        )
        .then((response: any) => {
          console.log(response);
          this.alertService.successAlert(response.message);
        })
        .catch((error: any) => {
          this.alertService.errorAlert(error.message);
        });
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
