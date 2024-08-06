import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';
import { CrudService } from '../../../core/services/crud.service';
import { CommonModule } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-create-reservation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgMultiSelectDropDownModule,
  ],
  templateUrl: './create-reservation.component.html',
  styleUrl: './create-reservation.component.css',
})
export class CreateReservationComponent implements OnInit {
  groupForm!: FormGroup;
  reservationForm!: FormGroup;
  propertyUnitId: string | null = '';
  roomsData: any[] = [];

  selectedItems: any = [];

  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.propertyUnitId =
      this.activeRoute.snapshot.paramMap.get('propertyUnitId');

    this.groupForm = this.fb.group({
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      adults: [0, [Validators.min(1), Validators.required]],
      childs: [0, Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      addressLine1: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      zipCode: ['', [Validators.required]],
    });
    this.reservationForm = this.fb.group({
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      adults: [0, [Validators.min(1), Validators.required]],
      childs: [0, Validators.required],
      rooms: this.fb.array([]),
    });
    this.readRooms();
  }

  get rooms(): FormArray {
    return this.reservationForm.get('rooms') as FormArray;
  }

  createRoomGroup(data?: any): FormGroup {
    return this.fb.group({});
  }

  addRoom(data?: any) {
    this.rooms.push(this.createRoomGroup(data));
  }

  readRooms() {
    this.roomsData = [
      {
        id: 'Classic',
        roomTypeId: '62876eac348c4f001e27cf8b',
        rooms: [
          {
            id: '62876ead348c4f001e27cf9a',
            roomStatus: 'vacant',
            roomCondition: 'clean',
            roomNumber: '102',
            roomName: 'C-102',
          },
          {
            id: '62876ead348c4f001e27cf9s',
            roomStatus: 'vacant',
            roomCondition: 'clean',
            roomNumber: '103',
            roomName: 'C-103',
          },
        ],
        roomAmenities: [],
        rateplanId: '42876eac348c4f001e27cf8b',
        rateName: 'Best Available Rate',
        adultOccupant: 2,
        childOccupant: 1,
        images: [
          'ROOMIMGDIR/c23b69d4-6da8-4ba9-8393-7796de4b4774',
          'ROOMIMGDIR/750644d0-b1d2-4a71-aa0d-6a4afcbf8109',
        ],
        dateRate: [
          {
            date: '2024-08-02T07:00:00.000Z',
            baserate: '200',
            adultrate: '100',
            childrate: '50',
          },
          {
            date: '2024-08-03T07:00:00.000Z',
            baserate: '200',
            adultrate: '100',
            childrate: '50',
          },
        ],
        roomtype: 'Classic',
        totalRoom: 2,
        roomPrice: 0,
        roomCost: 0,
        availability: 2,
      },

      {
        id: 'Classic',
        roomTypeId: '62876eac348c4f001e27',
        rooms: [
          {
            id: '62876ead348c4f001e27cf9a',
            roomStatus: 'vacant',
            roomCondition: 'clean',
            roomNumber: '102',
            roomName: 'C-102',
          },
          {
            id: '62876ead348c4f001e27cf9s',
            roomStatus: 'vacant',
            roomCondition: 'clean',
            roomNumber: '103',
            roomName: 'C-103',
          },
        ],
        roomAmenities: [],
        rateplanId: 'nrf',
        rateName: 'Non refund rate',
        adultOccupant: 2,
        childOccupant: 1,
        images: [
          'ROOMIMGDIR/c23b69d4-6da8-4ba9-8393-7796de4b4774',
          'ROOMIMGDIR/750644d0-b1d2-4a71-aa0d-6a4afcbf8109',
        ],
        dateRate: [
          {
            date: '2024-08-02T07:00:00.000Z',
            baserate: '180',
            adultrate: '100',
            childrate: '50',
          },
          {
            date: '2024-08-03T07:00:00.000Z',
            baserate: '180',
            adultrate: '100',
            childrate: '50',
          },
        ],
        roomtype: 'Classic',
        totalRoom: 2,
        roomPrice: 0,
        roomCost: 0,
        availability: 2,
      },

      {
        id: 'Delux',
        roomTypeId: 'delux-rt-id',
        rooms: [
          {
            id: 'd-r-1',
            roomStatus: 'vacant',
            roomCondition: 'clean',
            roomNumber: '4',
            roomName: 'D-4',
          },
          {
            id: 'd-r-2',
            roomStatus: 'vacant',
            roomCondition: 'clean',
            roomNumber: '5',
            roomName: 'D-5',
          },
          {
            id: 'd-r-3',
            roomStatus: 'vacant',
            roomCondition: 'clean',
            roomNumber: '6',
            roomName: 'D-6',
          },
        ],
        roomAmenities: [],
        rateplanId: 'nrf',
        rateName: 'Non refund rate',
        adultOccupant: 3,
        childOccupant: 0,
        images: [
          'ROOMIMGDIR/c23b69d4-6da8-4ba9-8393-7796de4b4774',
          'ROOMIMGDIR/750644d0-b1d2-4a71-aa0d-6a4afcbf8109',
        ],
        dateRate: [
          {
            date: '2024-08-02T07:00:00.000Z',
            baserate: '400',
            adultrate: '100',
            childrate: '50',
          },
          {
            date: '2024-08-03T07:00:00.000Z',
            baserate: '400',
            adultrate: '100',
            childrate: '50',
          },
        ],
        roomtype: 'Delux',
        totalRoom: 2,
        roomPrice: 0,
        roomCost: 0,
        availability: 3,
      },
    ];
    for (let r of this.roomsData) {
      r.dropdownSettings = {
        singleSelection: false,
        limitSelection: 0,
        idField: 'id',
        textField: 'roomName',
        unSelectAllText: 'UnSelect All',
        enableCheckAll: false,
        itemsShowLimit: 3,
        allowSearchFilter: true,
      };
      this.selectedItems.push([]);
    }
  }
  addRoomCount(i: number) {
    this.roomsData[i].dropdownSettings = Object.assign(
      {},
      this.roomsData[i].dropdownSettings,
      {
        limitSelection: this.roomsData[i].dropdownSettings.limitSelection + 1,
      }
    );
  }
  removeRoomCount(i: number) {
    this.roomsData[i].dropdownSettings = Object.assign(
      {},
      this.roomsData[i].dropdownSettings,
      {
        limitSelection: this.roomsData[i].dropdownSettings.limitSelection - 1,
      }
    );
    if (
      this.selectedItems[i].length >
      this.roomsData[i].dropdownSettings.limitSelection
    ) {
      let x = [...this.selectedItems[i]];
      x.splice(x.length - 1, 1);
      this.selectedItems[i] = Object.assign(x);
    }
  }
  trackByFn(index: number, item: any): any {
    return item.id; // or any unique identifier of the item
  }
  onSubmit() {
    let sendarray = [];
    console.log(this.groupForm.value, this.selectedItems);
    for (let i = 0; i < this.roomsData.length; i++) {
      if (this.roomsData[i].dropdownSettings.limitSelection > 0) {
        let currentCount = this.roomsData[i].dropdownSettings.limitSelection;
        for (let r of this.selectedItems[i]) {
          let newroom = this.roomsData[i].rooms.find((item: any) => {
            return item.id == r.id;
          });
          let sendObj = JSON.parse(JSON.stringify(this.roomsData[i]));
          sendObj.room = newroom;

          sendarray.push(sendObj);
          currentCount--;
        }
        while (currentCount != 0) {
          let sendObj = JSON.parse(JSON.stringify(this.roomsData[i]));
          sendObj.room = {
            id: 'assign',
            roomStatus: 'vacant',
            roomCondition: 'clean',
            roomNumber: 'default',
            roomName: 'default',
          };
          sendarray.push(sendObj);
          currentCount--;
        }
      }
    }
    console.log(sendarray);
    sessionStorage.setItem('reservationDetails', JSON.stringify(sendarray));
  }
}
