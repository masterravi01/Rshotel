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
    this.propertyUnitId = '6695584abc45f8d7ad2ead7b';
    let nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);

    this.groupForm = this.fb.group({
      arrival: [
        new DatePipe('en-US').transform(new Date(), 'yyyy-MM-dd'),
        Validators.required,
      ],
      departure: [
        new DatePipe('en-US').transform(nextDate, 'yyyy-MM-dd'),
        Validators.required,
      ],
      adults: [2, [Validators.min(1), Validators.required]],
      childs: [0, Validators.required],
    });
    this.reservationForm = this.fb.group({
      arrival: ['', Validators.required],
      departure: ['', Validators.required],
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
    this.crudService
      .post(
        APIConstant.READ_RESERVATION_RATE + this.propertyUnitId,
        this.groupForm.value
      )
      .then((response: any) => {
        console.log(response);
        this.roomsData = response.data;
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
            r.roomPrice += Number(d.baseRate);
          }
          for (let t of this.taxSets) {
            r.roomCost += Math.round(r.roomPrice * t.taxPercentage) / 100;
          }
          r.roomCost += r.roomPrice;
          this.selectedItems.push([]);
        }
      })
      .catch((error: any) => {
        this.alertService.errorAlert(error?.error?.message);
        console.log(error);
      });
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
          sendObj.roomId = newroom.id;
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
          sendObj.roomId = sendObj.room.id;
          currentCount--;
        }
      }
    }
    console.log(sendarray);
    sessionStorage.setItem(
      'groupDetails',
      JSON.stringify(this.groupForm.value)
    );
    sessionStorage.setItem('reservationDetails', JSON.stringify(sendarray));
    this.router.navigate(['/reservation-info']);
  }
}
