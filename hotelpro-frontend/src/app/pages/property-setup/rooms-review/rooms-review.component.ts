import { Component, OnInit } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';
import { CrudService } from '../../../core/services/crud.service';

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
  RoomReview!: FormGroup;
  PropertyUnitId: string | null = '';
  roomTypes: any[] = ['Delux', 'Suit'];

  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.PropertyUnitId =
      this.activeRoute.snapshot.paramMap.get('propertyunitid');
    this.RoomReview = this.fb.group({ Rooms: this.fb.array([]) });
    const drooms = [
      {
        roomType: 'Delux',
        roomId: '123',
        roomName: 'D101',
        roomNumber: '101',
      },
      {
        roomType: 'Suit',
        roomId: '222',
        roomName: 'D222',
        roomNumber: '222',
      },
    ];
    for (let r of drooms) {
      this.addRoom(r);
    }
  }

  createRoom(r?: any): FormGroup {
    return this.fb.group({
      roomName: [r?.roomName || '', [Validators.required]],
      roomNumber: [
        r?.roomNumber || 0,
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
      roomId: [r?.roomId || ''],
      roomType: [r?.roomType || this.roomTypes[0], Validators.required],
    });
  }

  addRoom(data?: any): void {
    this.rooms.push(this.createRoom(data));
  }

  get rooms(): FormArray {
    return this.RoomReview.get('Rooms') as FormArray;
  }

  editRecord(item: any): void {
    console.log(item);
  }

  deleteRecord(index: number): void {
    this.rooms.removeAt(index);
    console.log(this.RoomReview.value);
  }

  trackByFn(index: number, item: any): any {
    return item.id || index; // Use unique identifier or index as fallback
  }
}
