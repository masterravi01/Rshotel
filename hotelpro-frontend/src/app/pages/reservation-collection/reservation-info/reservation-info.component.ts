import { CommonModule, DatePipe } from '@angular/common';
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
import { ReservationSharedService } from '../../../core/services/reservation-shared.service';

@Component({
  selector: 'app-reservation-info',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, DatePipe],
  templateUrl: './reservation-info.component.html',
  styleUrls: ['./reservation-info.component.css'],
})
export class ReservationInfoComponent implements OnInit {
  reservationForm!: FormGroup;
  groupForm!: FormGroup;
  propertyUnitId: string | null = '';
  roomsData: any[] = [];
  updateDateRateObj: any = {};
  roomTypeRooms: any;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private crudService: CrudService,
    private alertService: AlertService,
    private activeRoute: ActivatedRoute,
    private reservationSharedService: ReservationSharedService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadData();
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

  private loadData(): void {
    // this.reservationSharedService.currentFormData.subscribe((data) => {
    //   this.groupForm.patchValue(data.groupDetails);
    //   this.populateReservations(data.reservationDetails);
    //   this.roomTypeRooms = data.roomTypeRooms;
    // });
    let d = sessionStorage.getItem('resdata');
    if (d) {
      let data = JSON.parse(d);
      this.groupForm.patchValue(data.groupDetails);
      this.populateReservations(data.reservationDetails);
      this.roomTypeRooms = data.roomTypeRooms;
    }
    this.propertyUnitId =
      this.activeRoute.snapshot.paramMap.get('propertyUnitId');
  }

  private formatDate(date: Date): string {
    return new DatePipe('en-US').transform(date, 'yyyy-MM-dd')!;
  }

  private createReservation(room?: any): FormGroup {
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
      taxPercentage: [room?.taxPercentage || 0],
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

  private createDateRates(dateRates: any[]): FormGroup[] {
    return dateRates.map((dateRate) => this.createDateRate(dateRate));
  }

  private createDateRate(dateRate?: any): FormGroup {
    return this.fb.group({
      date: [dateRate?.date || '', Validators.required],
      baseRate: [dateRate?.baseRate || '', Validators.required],
      adultRate: [dateRate?.adultRate || '', Validators.required],
      childRate: [dateRate?.childRate || '', Validators.required],
    });
  }

  private createGuests(guests: any[]): FormGroup[] {
    return guests.map((guest) => this.createGuest(guest));
  }

  private createGuest(guest?: any): FormGroup {
    return this.fb.group({
      firstName: [guest?.firstName || '', Validators.required],
      lastName: [guest?.lastName || '', Validators.required],
      email: [guest?.email || '', [Validators.required, Validators.email]],
      phone: [guest?.phone || '', Validators.required],
      addressLine1: [guest?.addressLine1 || ''],
      addressLine2: [guest?.addressLine2 || ''],
      country: [guest?.country || ''],
      city: [guest?.city || '', Validators.required],
      state: [guest?.state || '', Validators.required],
      zipCode: [guest?.zipCode || '', Validators.required],
      isSameAsCustomer: [false],
    });
  }

  private populateReservations(rooms: any[]): void {
    const reservationArray = this.reservationForm.get(
      'reservations'
    ) as FormArray;
    rooms.forEach((room) =>
      reservationArray.push(this.createReservation(room))
    );
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
  filterRooms(roomTypeRooms: any[], i: number): Array<any> {
    this.reservationForm
      .get('reservations')
      ?.value.forEach((element: any, index: number) => {
        if (i != index) {
          roomTypeRooms = roomTypeRooms.filter((r: any) => {
            return r.id != element.roomId;
          });
        }
      });
    return roomTypeRooms;
  }

  openUpdateRate(
    content: TemplateRef<any>,
    reservation: any,
    index: number
  ): void {
    this.updateDateRateObj = { ...reservation };
    this.modalService.open(content).result.then((result) => {
      if (result) {
        this.reservations.at(index).patchValue(this.updateDateRateObj);
      }
    });
  }

  calculateRate(): void {
    this.updateDateRateObj.roomPrice =
      Math.round((this.updateDateRateObj.roomCost / 1.11) * 100) / 100;
    const onlyRoomCharges =
      Math.round(
        (this.updateDateRateObj.roomPrice /
          this.updateDateRateObj.dateRate.length) *
          100
      ) / 100;
    this.updateDateRateObj.dateRate.forEach((r: any) => {
      r.baseRate = onlyRoomCharges;
    });
  }

  onSubmit(): void {
    const sendObj = {
      reservationsArray: this.reservationForm.get('reservations')?.value,
      groupDetails: {
        propertyUnitId: this.propertyUnitId,
        ...this.groupForm.value,
      },
    };

    this.crudService
      .post(APIConstant.CREATE_RESERVATION, sendObj)
      .then((response) => console.log(response))
      .catch((error) => {
        this.alertService.errorAlert(
          error?.error?.message || 'An error occurred'
        );
        console.error(error);
      });
  }
}
