import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';
import { CrudService } from '../../../core/services/crud.service';
import { APIConstant } from '../../../core/constants/APIConstant';

@Component({
  selector: 'app-rooms-review',
  templateUrl: './rooms-review.component.html',
  styleUrls: ['./rooms-review.component.css'],
})
export class RoomsReviewComponent implements OnInit {
  columnArray: any[] = [];
  showActionBtn: boolean = true;
  filterData: any[] = [];
  searchbox: string = '';
  propertyUnitId: string | null = '';
  roomTypesForm!: FormGroup;
  expandedRowIndices: Set<number> = new Set<number>();

  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.propertyUnitId =
      this.activeRoute.snapshot.paramMap.get('propertyUnitId');
    this.roomTypesForm = this.fb.group({
      roomTypes: this.fb.array([]),
    });

    this.crudService
      .post(APIConstant.READ_ROOMTYPE_AND_ROOMS + this.propertyUnitId)
      .then((response: any) => {
        console.log(response);
        for (let roomtype of response.data) {
          this.addRoomType(roomtype);
        }
        this.alertService.successAlert(response.message);
      })
      .catch((error: any) => {
        this.alertService.errorAlert(error.message);
        console.log(error);
      });
  }

  createRoom(r?: any): FormGroup {
    const roomform = this.fb.group({
      roomName: [r?.roomName || '', [Validators.required]],
      roomNumber: [
        r?.roomNumber || '',
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      roomId: [r?.roomId || ''],
      roomTypeId: [r?.roomTypeId || '', Validators.required],
    });
    if (r?.roomId) {
      roomform.disable();
    }
    return roomform;
  }

  addRoom(roomTypeIndex: number, room?: any): void {
    console.log(this.roomTypesForm.value, room);
    const rooms = this.getRooms(roomTypeIndex);
    rooms.push(this.createRoom(room));
  }

  get roomTypes(): FormArray {
    return this.roomTypesForm.get('roomTypes') as FormArray;
  }

  createRoomType(r?: any): FormGroup {
    const roomTypeForm = this.fb.group({
      roomTypeId: [r?.roomTypeId || '', Validators.required],
      roomTypeName: [r?.roomTypeName || '', Validators.required],
      active: [r?.active || false],
      roomTypeCategory: [r?.roomTypeCategory || 'Room', Validators.required],
      description: [r?.description || '', Validators.required],
      adultOccupancy: [
        r?.adultOccupancy || 0,
        [Validators.min(1), Validators.required],
      ],
      childOccupancy: [r?.childOccupancy || 0, Validators.required],
      totalrooms: [
        r?.rooms?.length || 0,
        [Validators.min(1), Validators.required],
      ],
      rooms: this.fb.array([]),
    });
    if (r?.rooms) {
      const roomsArray = roomTypeForm.get('rooms') as FormArray;
      for (let room of r.rooms) {
        roomsArray.push(this.createRoom(room));
      }
    }
    return roomTypeForm;
  }

  addRoomType(roomType?: any): void {
    this.roomTypes.push(this.createRoomType(roomType));
  }

  editRoomType(index: number, data: any): void {
    const roomType = this.roomTypes.at(index);
    roomType.patchValue(data);
    console.log(roomType.value);
  }

  deleteRoomType(index: number): void {
    this.roomTypes.removeAt(index);
  }

  editRoom(roomTypeIndex: number, roomIndex: number, data: any): void {
    const room = this.getRooms(roomTypeIndex).at(roomIndex);
    console.log(room.value);
    const obj = room.value;
    let callapi = APIConstant.UPDATE_ROOM + obj.roomId;
    if (!obj?.roomId) {
      callapi = APIConstant.CREATE_ROOM;
    }
    this.crudService
      .post(callapi, obj)
      .then((response: any) => {
        console.log(response);
        response.data.roomId = response.data._id;
        room.patchValue(response.data);
        room.disable();
        this.alertService.successAlert(response.message);
      })
      .catch((error: any) => {
        this.alertService.errorAlert(error.message);
        console.log(error);
      });
  }

  deleteRoom(roomTypeIndex: number, roomIndex: number): void {
    const rooms = this.getRooms(roomTypeIndex);
    if (rooms.controls[roomIndex].value.roomId) {
      this.crudService
        .post(APIConstant.DELETE_ROOM + rooms.controls[roomIndex].value.roomId)
        .then((response: any) => {
          console.log(response);
          rooms.removeAt(roomIndex);
          this.alertService.successAlert(response.message);
        })
        .catch((error: any) => {
          this.alertService.errorAlert(error.message);
          console.log(error);
        });
    } else {
      rooms.removeAt(roomIndex);
    }
  }

  trackByFn(index: number, item: any): any {
    return item.id || index; // Use unique identifier or index as fallback
  }

  getRooms(roomTypeIndex: number): FormArray {
    return this.roomTypes.at(roomTypeIndex).get('rooms') as FormArray;
  }

  toggleRow(index: number): void {
    if (this.expandedRowIndices.has(index)) {
      this.expandedRowIndices.delete(index);
    } else {
      this.expandedRowIndices.add(index);
    }
  }

  isRowExpanded(index: number): boolean {
    return this.expandedRowIndices.has(index);
  }
}
