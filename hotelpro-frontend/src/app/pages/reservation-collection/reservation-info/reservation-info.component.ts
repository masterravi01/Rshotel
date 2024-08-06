import { CommonModule, JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';

@Component({
  selector: 'app-reservation-info',
  standalone: true,
  imports: [JsonPipe, FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './reservation-info.component.html',
  styleUrls: ['./reservation-info.component.css'],
})
export class ReservationInfoComponent implements OnInit {
  groupReservationForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    let x = sessionStorage.getItem('reservationDetails');

    if (x) {
      this.groupReservationForm = this.fb.group({
        reservations: this.fb.array([]),
      });
      this.populateReservations(JSON.parse(x));
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
    });
  }

  createDateRates(dateRates: any[]): FormGroup[] {
    return dateRates.map((dateRate) => this.createDateRate(dateRate));
  }

  createDateRate(dateRate?: any): FormGroup {
    return this.fb.group({
      date: [dateRate?.date || '', Validators.required],
      baserate: [dateRate?.baserate || '', Validators.required],
      adultrate: [dateRate?.adultrate || '', Validators.required],
      childrate: [dateRate?.childrate || '', Validators.required],
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
      addressLine1: [guest?.addressLine1 || '', Validators.required],
      city: [guest?.city || '', Validators.required],
      state: [guest?.state || '', Validators.required],
      zipCode: [guest?.zipCode || '', Validators.required],
    });
  }

  populateReservations(rooms: any[]): void {
    const reservationArray = this.groupReservationForm.get(
      'reservations'
    ) as FormArray;
    rooms.forEach((room) => {
      reservationArray.push(this.createReservation(room));
    });
  }

  get reservations(): FormArray {
    return this.groupReservationForm.get('reservations') as FormArray;
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
  onSubmit() {
    console.log(this.groupReservationForm.value);
  }
}
