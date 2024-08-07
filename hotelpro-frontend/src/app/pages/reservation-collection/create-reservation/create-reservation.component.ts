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
import { CommonModule, DatePipe } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { APIConstant } from '../../../core/constants/APIConstant';

@Component({
  selector: 'app-create-reservation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgMultiSelectDropDownModule,
    DatePipe,
  ],
  templateUrl: './create-reservation.component.html',
  styleUrl: './create-reservation.component.css',
})
export class CreateReservationComponent implements OnInit {
  groupForm!: FormGroup;
  reservationForm!: FormGroup;
  propertyUnitId: string | null = '';
  roomsData: any[] = [];
  taxSets: any[] = [];
  selectedItems: any = [];
  totalGuests: any = {
    adults: 0,
    childs: 0,
    totalCost: 0,
  };
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
    let nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);

    this.groupForm = this.fb.group({
      checkInDate: [
        new DatePipe('en-US').transform(new Date(), 'yyyy-MM-dd'),
        Validators.required,
      ],
      checkOutDate: [
        new DatePipe('en-US').transform(nextDate, 'yyyy-MM-dd'),
        Validators.required,
      ],
      adults: [2, [Validators.min(1), Validators.required]],
      childs: [0, Validators.required],
      // firstName: ['', [Validators.required, Validators.minLength(2)]],
      // lastName: ['', [Validators.required, Validators.minLength(2)]],
      // email: ['', [Validators.required, Validators.email]],
      // phone: ['', [Validators.required]],
      // addressLine1: [''],
      // city: ['', [Validators.required]],
      // state: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      // zipCode: ['', [Validators.required]],
    });
    this.reservationForm = this.fb.group({
      checkInDate: ['', Validators.required],
      checkOutDate: ['', Validators.required],
      adults: [0, [Validators.min(1), Validators.required]],
      childs: [0, Validators.required],
      rooms: this.fb.array([]),
    });
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
    this.totalGuests.adults = 0;
    this.totalGuests.childs = 0;
    this.totalGuests.Cost = 0;
    console.log(
      this.groupForm.value,
      this.totalGuests,
      this.totalGuests?.adults,
      this.totalGuests?.childs,
      this.groupForm.get('adults')?.value,
      this.groupForm.get('childs')?.value
    );
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
        adultOccupant: 2,
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
    this.taxSets = [
      {
        _id: '66a22c9bcf0cd16300f72a39',
        propertyUnitId: '6695584abc45f8d7ad2ead7b',
        taxPercentage: 11,
        taxName: 'SGST',
        active: false,
        createdAt: {
          $date: '2024-07-25T10:44:43.102Z',
        },
        updatedAt: {
          $date: '2024-07-25T10:45:02.431Z',
        },
        __v: 0,
      },
    ];
    // this.crudService
    //   .post(
    //     APIConstant.READ_ROOMTYPE_AND_ROOMS + this.propertyUnitId,
    //     this.groupForm.value
    //   )
    //   .then((response: any) => {
    //     console.log(response);
    //     this.roomsData = response.data;
    //   })
    //   .catch((error: any) => {
    //     this.alertService.errorAlert(error?.error?.message);
    //     console.log(error);
    //   });
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
      for (let d of r.dateRate) {
        r.roomPrice += Number(d.adultrate);
      }
      for (let t of this.taxSets) {
        r.roomCost += Math.round((r.roomPrice / t.taxPercentage) * 100) / 100;
      }
      r.roomCost += r.roomPrice;
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
    this.totalGuests.adults += this.roomsData[i].adultOccupant;
    this.totalGuests.childs += this.roomsData[i].childOccupant;
    this.totalGuests.Cost += this.roomsData[i].roomCost;
    console.log(this.totalGuests);
  }
  removeRoomCount(i: number) {
    this.roomsData[i].dropdownSettings = Object.assign(
      {},
      this.roomsData[i].dropdownSettings,
      {
        limitSelection: this.roomsData[i].dropdownSettings.limitSelection - 1,
      }
    );
    this.totalGuests.adults -= this.roomsData[i].adultOccupant;
    this.totalGuests.childs -= this.roomsData[i].childOccupant;
    this.totalGuests.Cost -= this.roomsData[i].roomCost;
    console.log(this.totalGuests);
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
    this.router.navigate(['/reservation-info']);
  }
}
