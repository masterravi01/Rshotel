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
  updateDateRate: any[] = [];

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private crudService: CrudService,
    private alertService: AlertService,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    let x = sessionStorage.getItem('reservationDetails');
    let gropFormDetails = sessionStorage.getItem('groupDetails');
    this.propertyUnitId =
      this.activeRoute.snapshot.paramMap.get('propertyUnitId');
    this.propertyUnitId = '6695584abc45f8d7ad2ead7b';
    if (x) {
      this.reservationForm = this.fb.group({
        reservations: this.fb.array([]),
      });
      this.populateReservations(JSON.parse(x));
    }
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
    if (gropFormDetails) {
      this.groupForm.patchValue(JSON.parse(gropFormDetails));
    }
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
    debugger;
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

  addReservation() {
    this.reservations.push(this.createReservation());
  }

  getDateRates(reservation: AbstractControl): FormArray {
    return reservation.get('dateRate') as FormArray;
  }

  getGuests(reservation: AbstractControl): FormArray {
    return reservation.get('guests') as FormArray;
  }

  addGuest(reservationIndex: number) {
    const guests = this.getGuests(this.reservations.at(reservationIndex));
    guests.push(this.createGuest());
  }

  removeGuest(reservationIndex: number, guestIndex: number) {
    const guests = this.getGuests(this.reservations.at(reservationIndex));
    if (guests.length > 1) {
      guests.removeAt(guestIndex);
    }
  }

  sameAsCustomer(guestForm: AbstractControl, event: any) {
    if (event.target.checked) {
      guestForm.patchValue(this.groupForm.value);
    }
  }
  openUpdateRate(content: TemplateRef<any>, daterate: any): void {
    this.updateDateRate = JSON.parse(JSON.stringify(daterate));
    this.modalService.open(content).result.then((result) => {
      console.log(result, this.updateDateRate);
      if (result) {
      } else {
      }
    });
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
