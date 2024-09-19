import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';
import { CrudService } from '../../../core/services/crud.service';
import { APIConstant } from '../../../core/constants/APIConstant';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  JsonPipe,
} from '@angular/common';
import { NgImageSliderModule } from 'ng-image-slider-v17';
import { AuthService } from '../../../core/services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-guest-folio',
  standalone: true,
  imports: [
    JsonPipe,
    DatePipe,
    CurrencyPipe,
    CommonModule,
    NgImageSliderModule,
    FormsModule,
    NgMultiSelectDropDownModule,
  ],
  templateUrl: './guest-folio.component.html',
  styleUrl: './guest-folio.component.css',
})
export class GuestFolioComponent implements OnInit {
  groupDetails: any;
  propertyUnitId: string | null = '';
  groupId: string | null = '';
  updateStayArrival: string = '';
  updateStayDeparture: string = '';
  roomsData: any[] = [];
  selectedItems: any[] = [];
  roomTypeRooms: Record<string, any[]> = {};
  currentRoomCount = 0;
  currentReservation: any;
  imageObject = [
    {
      image:
        'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
      thumbImage:
        'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    },
    {
      image:
        'https://media.istockphoto.com/id/1390233984/photo/modern-luxury-bedroom.jpg?s=612x612&w=0&k=20&c=po91poqYoQTbHUpO1LD1HcxCFZVpRG-loAMWZT7YRe4=',
      thumbImage:
        'https://media.istockphoto.com/id/1390233984/photo/modern-luxury-bedroom.jpg?s=612x612&w=0&k=20&c=po91poqYoQTbHUpO1LD1HcxCFZVpRG-loAMWZT7YRe4=',
    },
    {
      image:
        'https://assets.architecturaldigest.in/photos/60084dd6cce5700439e12bf7/16:9/w_2560%2Cc_limit/modern-living-room-decor-1366x768.jpg',
      thumbImage:
        'https://assets.architecturaldigest.in/photos/60084dd6cce5700439e12bf7/16:9/w_2560%2Cc_limit/modern-living-room-decor-1366x768.jpg',
      title: 'Example with title.',
    },
  ];
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private authService: AuthService,
    private crudService: CrudService,
    private modalService: NgbModal
  ) {}
  ngOnInit(): void {
    this.propertyUnitId = this.authService.getUserInfo()?.user?.propertyUnitId;
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    if (this.groupId) {
      this.crudService
        .post(APIConstant.GUEST_FOLIO, { groupId: this.groupId })
        .then((response) => {
          console.log(response);
          this.groupDetails = response.data;
        })
        .catch((error) => {
          this.alertService.errorAlert(
            error?.error?.message ||
              'An error occurred while processing payment'
          );
          console.error(error);
        });
    }
  }

  updateStay(reservationId: any) {
    this.crudService
      .post(APIConstant.STAY_UPDATE, {
        reservationId: reservationId,
        propertyUnitId: this.propertyUnitId,
        groupId: this.groupId,
        assigncheckindate: new Date(this.updateStayArrival),
        assigncheckoutdate: new Date(this.updateStayDeparture),
      })
      .then((response) => {
        console.log(response);
        this.alertService.successAlert(response.message);
        this.ngOnInit();
      })
      .catch((error) => {
        this.alertService.errorAlert(
          error?.error?.message || 'An error occurred while processing payment'
        );
        console.error(error);
      });
  }
  private formatDate(date: Date): string {
    return new DatePipe('en-US').transform(date, 'yyyy-MM-dd') || '';
  }
  openUpdateStayModal(reservation: any, content: any): void {
    this.updateStayArrival = this.formatDate(new Date(reservation.arrival));
    this.updateStayDeparture = this.formatDate(new Date(reservation.departure));
    this.modalService.open(content).result.then((result) => {
      if (result) {
        this.updateStay(reservation._id);
      }
    });
  }

  openAddRoomModal(content: any): void {
    this.currentRoomCount = 0;
    this.crudService
      .post(APIConstant.READ_RESERVATION_RATE + this.propertyUnitId, {
        arrival: new Date(this.groupDetails.arrival),
        departure: new Date(this.groupDetails.departure),
      })
      .then((response: any) => {
        console.log(response.data);
        this.processRoomsData(response.data);
        this.modalService
          .open(content, {
            size: 'lg',
            centered: true,
            backdrop: 'static',
            keyboard: false,
          })
          .result.then((result) => {
            if (result) {
              const reservationDetails = this.prepareReservationDetails();
              this.crudService
                .post(APIConstant.ADD_ROOM, {
                  groupData: this.groupDetails,
                  propertyUnitId: this.propertyUnitId,
                  reservation: reservationDetails[0],
                })
                .then((response) => {
                  console.log(response);
                  this.alertService.successAlert(response.message);
                  this.ngOnInit();
                })
                .catch((error) => {
                  this.alertService.errorAlert(
                    error?.error?.message ||
                      'An error occurred while processing payment'
                  );
                  console.error(error);
                });
            }
          });
      })
      .catch((error: any) => {
        this.alertService.errorAlert(error?.error?.message);
      });
  }

  private processRoomsData(data: any[]): void {
    this.roomsData = data.map((room) => {
      room.dropdownSettings = {
        singleSelection: false,
        limitSelection: 0,
        idField: 'id',
        textField: 'roomName',
        unSelectAllText: 'UnSelect All',
        enableCheckAll: false,
        itemsShowLimit: 3,
        allowSearchFilter: true,
      };
      room.extraAdults = 0;
      room.extraChilds = 0;
      [room.roomPrice, room.roomCost] = this.calculateRoomCost(room);
      if (!this.roomTypeRooms[room.roomTypeId]) {
        this.roomTypeRooms[room.roomTypeId] = room.rooms;
      }
      this.selectedItems.push([]);
      return room;
    });
  }
  private calculateRoomCost(room: any): [number, number] {
    const basePrice = room.dateRate.reduce(
      (total: number, rate: any) =>
        total +
        Number(rate.baseRate) +
        Number(rate.adultRate * room.extraAdults) +
        Number(rate.childRate * room.extraChilds),
      0
    );
    const taxAmount = (basePrice * room.taxPercentage) / 100;
    return [basePrice, basePrice + taxAmount];
  }
  addRoomCount(index: number): void {
    this.currentRoomCount += 1;
    this.updateRoomSelection(index, 1);
  }

  removeRoomCount(index: number): void {
    this.currentRoomCount -= 1;
    this.updateRoomSelection(index, -1);
  }

  private updateRoomSelection(index: number, increment: number): void {
    const room = this.roomsData[index];
    room.dropdownSettings = Object.assign({}, room.dropdownSettings, {
      limitSelection: room.dropdownSettings.limitSelection + increment,
    });
    this.roomsData.forEach((element: any, i: number) => {
      if (i !== index && element.roomTypeId === room.roomTypeId) {
        element.totalRoom -= increment;
      }
    });

    // this.totalGuests.adults += increment * room.adultOccupant;
    // this.totalGuests.childs += increment * room.childOccupant;

    // this.groupForm.controls.totalCost.patchValue(
    //   this.groupForm.get('totalCost')?.value + increment * room.roomCost
    // );
    // this.groupForm.controls.totalPrice.patchValue(
    //   this.groupForm.get('totalPrice')?.value + increment * room.roomPrice
    // );
    if (
      increment < 0 &&
      this.selectedItems[index].length > room.dropdownSettings.limitSelection
    ) {
      let x = [...this.selectedItems[index]];
      x.splice(x.length - 1, 1);
      this.selectedItems[index] = Object.assign(x);
    }
  }
  private prepareReservationDetails(): any[] {
    return this.roomsData.reduce((acc: any[], room: any, index: number) => {
      if (room.dropdownSettings.limitSelection > 0) {
        const roomDetails = this.createRoomDetails(room, index);
        return acc.concat(roomDetails);
      }
      return acc;
    }, []);
  }

  private createRoomDetails(room: any, index: number): any[] {
    const selectedRooms = this.selectedItems[index].map(
      (selectedRoom: any) => ({
        ...room,
        room,
        roomId: selectedRoom.id,
      })
    );

    const unassignedRooms = Array(
      room.dropdownSettings.limitSelection - selectedRooms.length
    ).fill({
      ...room,
      room: {
        id: 'assign',
        roomStatus: 'vacant',
        roomCondition: 'clean',
        roomNumber: 'default',
        roomName: 'default',
      },
      roomId: 'assign',
    });

    return selectedRooms.concat(unassignedRooms);
  }
  dropDownData(rooms: any[], index: number): any[] {
    return rooms.filter(
      (room: any) =>
        !this.selectedItems.some(
          (selectedRooms: any[], i: number) =>
            i !== index && selectedRooms.some((r: any) => r.id === room.id)
        )
    );
  }
  openChangeRoomModal(reservation: any, content: any): void {
    this.currentReservation = reservation;
    this.crudService
      .post(APIConstant.READ_RESERVATION_RATE + this.propertyUnitId, {
        arrival: new Date(reservation.arrival),
        departure: new Date(reservation.departure),
      })
      .then((response: any) => {
        console.log(response.data);
        this.processRoomsData(response.data);
        this.modalService.open(content, {
          size: 'lg',
          centered: true,
          backdrop: 'static',
          keyboard: false,
        });
      })
      .catch((error: any) => {
        this.alertService.errorAlert(error?.error?.message);
      });
  }

  callChangeRoom(newReservation: any, room: any) {
    newReservation.room = room;
    newReservation.roomId = room.id;
    this.crudService
      .post(APIConstant.CHANGE_ROOM, {
        groupData: this.groupDetails,
        propertyUnitId: this.propertyUnitId,
        reservation: newReservation,
        oldReservation: this.currentReservation,
      })
      .then((response) => {
        console.log(response);
        this.modalService.dismissAll();
        this.alertService.successAlert(response.message);
        this.ngOnInit();
      })
      .catch((error) => {
        this.alertService.errorAlert(
          error?.error?.message || 'An error occurred while processing payment'
        );
        console.error(error);
      });
  }
}
