import { CommonModule, DatePipe, JsonPipe } from '@angular/common';
import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CrudService } from '../../../core/services/crud.service';
import { APIConstant } from '../../../core/constants/APIConstant';
import { AlertService } from '../../../core/services/alert.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reservation-info',
  standalone: true,
  imports: [JsonPipe, FormsModule, ReactiveFormsModule, CommonModule, DatePipe],
  templateUrl: './reservation-info.component.html',
  styleUrls: ['./reservation-info.component.css'],
})
export class ReservationInfoComponent implements OnInit {
  reservationForm!: FormGroup;
  groupForm!: FormGroup;
  propertyUnitId: string | null = '';
  roomsData: any[] = [];
  taxSets: any[] = [];
  updateDateRateObj: any = [];
  roomTypeRooms: any;
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private crudService: CrudService,
    private alertService: AlertService,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadSessionData();
    this.roomTypeRooms = {
      '66b49ae7bf6f49a8b070e65a': [
        {
          id: '66b49c1982d1f12766b04d0f',
          roomStatus: 'vacant',
          roomCondition: 'clean',
          roomNumber: '1',
          roomName: '1',
        },
        {
          id: '66b49c2f82d1f12766b04d13',
          roomStatus: 'vacant',
          roomCondition: 'clean',
          roomNumber: '2',
          roomName: '2',
          selected: true,
        },
        {
          id: '66b49c3082d1f12766b04d17',
          roomStatus: 'vacant',
          roomCondition: 'clean',
          roomNumber: '3',
          roomName: '3',
          selected: true,
        },
      ],
    };
  }

  private initializeForms(): void {
    this.reservationForm = this.fb.group({
      reservations: this.fb.array([]),
    });

    this.groupForm = this.fb.group({
      arrival: [this.formatDate(new Date()), Validators.required],
      departure: [this.formatDate(new Date()), Validators.required],
      adults: [2, [Validators.min(1), Validators.required]],
      childs: [0, Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      addressLine1: [''],
      addressLine2: [''],
      country: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      zipCode: ['', [Validators.required]],
    });
  }

  private loadSessionData(): void {
    const reservationDetails = sessionStorage.getItem('reservationDetails');
    const groupDetails = sessionStorage.getItem('groupDetails');
    this.propertyUnitId =
      this.activeRoute.snapshot.paramMap.get('propertyUnitId') ||
      '6695584abc45f8d7ad2ead7b';

    if (reservationDetails) {
      this.populateReservations(JSON.parse(reservationDetails));
    }
    if (groupDetails) {
      this.groupForm.patchValue(JSON.parse(groupDetails));
    }
  }

  private formatDate(date: Date): string {
    return new DatePipe('en-US').transform(date, 'yyyy-MM-dd')!;
  }

  createReservation(room?: any): FormGroup {
    return this.fb.group({
      roomTypeId: [room?.roomTypeId || '', Validators.required],
      roomId: [room?.roomId || '', Validators.required],
      rateplanId: [room?.rateplanId || '', Validators.required],
      rateName: [room?.rateName || '', Validators.required],
      roomtype: [room?.roomtype || '', Validators.required],
      adultOccupant: [room?.adultOccupant || 0, Validators.required],
      childOccupant: [room?.childOccupant || 0],
      extraAdults: [room?.extraAdults || 0],
      extraChilds: [room?.extraChilds || 0],
      roomPrice: [room?.roomPrice || 0, Validators.required],
      roomCost: [room?.roomCost || 0, Validators.required],
      images: [room?.images || [], Validators.required],
      dateRate: this.fb.array(
        room ? this.createDateRates(room.dateRate) : [this.createDateRate()]
      ),
      guests: this.fb.array(
        room?.guests ? this.createGuests(room.guests) : [this.createGuest()]
      ),
      isDetailsVisiable: [true],
    });
  }

  createDateRates(dateRates: any[]): FormGroup[] {
    return dateRates.map((dateRate) => this.createDateRate(dateRate));
  }

  createDateRate(dateRate?: any): FormGroup {
    return this.fb.group({
      date: [dateRate?.date || '', Validators.required],
      baseRate: [dateRate?.baseRate || '', Validators.required],
      adultRate: [dateRate?.adultRate || '', Validators.required],
      childRate: [dateRate?.childRate || '', Validators.required],
    });
  }

  createGuests(guests: any[]): FormGroup[] {
    return guests.map((guest) => this.createGuest(guest));
  }

  createGuest(guest?: any): FormGroup {
    return this.fb.group({
      firstName: [guest?.firstName || '', Validators.required],
      lastName: [guest?.lastName || '', Validators.required],
      email: [guest?.email || '', [Validators.required, Validators.email]],
      phone: [guest?.phone || '', Validators.required],
      addressLine1: [guest?.addressLine1 || ''],
      addressLine2: [guest?.addressLine2 || ''],
      country: [''],
      city: [guest?.city || '', Validators.required],
      state: [guest?.state || '', Validators.required],
      zipCode: [guest?.zipCode || '', Validators.required],
      isSameAsCustomer: [false],
    });
  }

  populateReservations(rooms: any[]): void {
    const reservationArray = this.reservationForm.get(
      'reservations'
    ) as FormArray;
    rooms.forEach((room) => {
      reservationArray.push(this.createReservation(room));
    });
  }

  get reservations(): FormArray {
    return this.reservationForm.get('reservations') as FormArray;
  }

  addReservation(): void {
    this.reservations.push(this.createReservation());
  }

  getDateRates(reservation: AbstractControl): FormArray {
    return reservation.get('dateRate') as FormArray;
  }

  getGuests(reservation: AbstractControl): FormArray {
    return reservation.get('guests') as FormArray;
  }

  addGuest(reservationIndex: number): void {
    const guests = this.getGuests(this.reservations.at(reservationIndex));
    guests.push(this.createGuest());
  }

  removeGuest(reservationIndex: number, guestIndex: number): void {
    const guests = this.getGuests(this.reservations.at(reservationIndex));
    if (guests.length > 1) {
      guests.removeAt(guestIndex);
    }
  }

  sameAsCustomer(guestForm: AbstractControl, event: any): void {
    if (event.target.checked) {
      guestForm.patchValue(this.groupForm.value);
    }
  }
  changeRoom(e: any, reservation: AbstractControl) {
    for (let r of this.roomTypeRooms[reservation.get('roomTypeId')?.value]) {
      if (r.id == reservation.get('roomId')?.value) {
        delete r.selected;
      }
      if (e.target.value == r.id) {
        r.selected = true;
      }
    }
  }
  openUpdateRate(content: TemplateRef<any>, reservation: any, i: number): void {
    this.updateDateRateObj = JSON.parse(JSON.stringify(reservation));
    console.log(this.updateDateRateObj);
    this.modalService.open(content).result.then((result) => {
      if (result) {
        // Handle confirmed modal result
        this.reservations['controls'][i].patchValue(this.updateDateRateObj);
      } else {
        // Handle dismissed modal result
      }
    });
  }
  calculateRate() {
    this.updateDateRateObj.roomPrice =
      Math.round((this.updateDateRateObj.roomCost / 1.11) * 100) / 100;
    let onlyRoomCharges =
      Math.round(
        (this.updateDateRateObj.roomPrice /
          this.updateDateRateObj.dateRate.length) *
          100
      ) / 100;
    for (let r of this.updateDateRateObj.dateRate) {
      r.baseRate = onlyRoomCharges;
    }
  }
  onSubmit() {
    let sendObj = {
      reservationsArray: this.reservationForm.get('reservations')?.value,
      groupDetails: {
        propertyUnitId: this.propertyUnitId,
        ...this.groupForm.value,
      },
    };
    console.log(this.reservationForm.value, this.groupForm.value);
    this.crudService
      .post(APIConstant.CREATE_RESERVATION, sendObj)
      .then((response: any) => {
        console.log(response);
      })
      .catch((error: any) => {
        this.alertService.errorAlert(error?.error?.message);
        console.log(error);
      });
  }
}
