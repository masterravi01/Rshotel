import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { NgxFileDropModule } from 'ngx-file-drop';
import {
  NgxFileDropEntry,
  FileSystemFileEntry,
  FileSystemDirectoryEntry,
} from 'ngx-file-drop';
import { StatusPipe } from '../../../core/shared/pipes/status.pipe';
import { BalancePipe } from '../../../core/shared/pipes/balance.pipe';

@Component({
  selector: 'app-guest-folio',
  standalone: true,
  imports: [
    JsonPipe,
    DatePipe,
    CurrencyPipe,
    StatusPipe,
    BalancePipe,
    CommonModule,
    NgImageSliderModule,
    FormsModule,
    NgMultiSelectDropDownModule,
    ReactiveFormsModule,
    NgxFileDropModule,
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
  documentsImages: any[] = [];
  paymentForm!: FormGroup;
  refundForm!: FormGroup;
  postChargeForm!: FormGroup;
  guestForm!: FormGroup;
  noshowDetails: any = {};
  cancelDetails: any = {};
  public files: NgxFileDropEntry[] = [];
  Today: string = '';
  FormatToday: string = '';
  confirmMsg: string = '';
  depositObj: any = {};
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
  @ViewChild('noshowReservationModal', { static: true })
  noshowReservationModal!: ElementRef;
  @ViewChild('cancelReservationModal', { static: true })
  cancelReservationModal!: ElementRef;
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
    let d = new Date();
    this.FormatToday = this.formatDate(d);
    d.setUTCHours(0, 0, 0, 0);
    this.Today = d.toISOString();
    this.propertyUnitId = this.authService.getUserInfo()?.user?.propertyUnitId;
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    this.loadGroupDetails();
    this.initializeForms();
  }
  private initializeForms() {
    this.paymentForm = this.fb.group({
      groupId: ['', [Validators.required]],
      paymentType: ['cash', [Validators.required]],
      deposit: [false],
      amount: [10, [Validators.required, Validators.min(0)]],
      remark: [''],
    });
    this.refundForm = this.fb.group({
      groupId: ['', [Validators.required]],
      paymentType: ['cash', [Validators.required]],
      amount: [10, [Validators.required, Validators.min(0)]],
      maxRefund: [0, [Validators.required, Validators.min(0)]],
      remark: [''],
    });

    this.postChargeForm = this.fb.group({
      groupId: ['', [Validators.required]],
      reservationId: ['', [Validators.required]],
      reason: ['penalty', [Validators.required]],
      charge: [10, [Validators.required, Validators.min(0)]],
    });
  }

  // Load group details
  private loadGroupDetails() {
    if (this.groupId) {
      this.crudService
        .post(APIConstant.GUEST_FOLIO, { groupId: this.groupId })
        .then((response) => {
          this.groupDetails = response.data;
        })
        .catch((error) => {
          this.alertService.errorAlert(
            error?.error?.message || 'An error occurred '
          );
          console.error(error);
        });
    }
  }
  updateStay(reservationId: any) {
    const updatePayload = {
      reservationId: reservationId,
      propertyUnitId: this.propertyUnitId,
      groupId: this.groupId,
      assigncheckindate: new Date(this.updateStayArrival),
      assigncheckoutdate: new Date(this.updateStayDeparture),
    };

    this.crudService
      .post(APIConstant.STAY_UPDATE, updatePayload)
      .then((response) => {
        this.alertService.successAlert(response.message);
        this.loadGroupDetails();
      })
      .catch((error) => {
        this.alertService.errorAlert(
          error?.error?.message || 'An error occurred '
        );
        console.error(error);
      });
  }
  private formatDate(date: Date): string {
    return new DatePipe('en-US').transform(date, 'yyyy-MM-dd') || '';
  }
  nextDate() {
    let x = new Date(this.updateStayArrival);
    x.setDate(x.getDate() + 1);
    return this.formatDate(x);
  }
  checkDate() {
    return (
      new Date(this.updateStayArrival) < new Date(this.updateStayDeparture)
    );
  }
  // Open modal for stay update
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

    // Fetch reservation rates for the selected property unit based on arrival and departure dates.
    this.crudService
      .post(APIConstant.READ_RESERVATION_RATE + this.propertyUnitId, {
        arrival: new Date(this.groupDetails.arrival),
        departure: new Date(this.groupDetails.departure),
      })
      .then((response: any) => {
        console.log(response.data);
        this.processRoomsData(response.data); // Process the room data
        this.modalService
          .open(content, {
            size: 'lg',
            centered: true,
            backdrop: 'static',
            keyboard: false,
          })
          .result.then((result) => {
            if (result) {
              const reservationDetails = this.prepareReservationDetails(); // Prepare room reservation details
              this.crudService
                .post(APIConstant.ADD_ROOM, {
                  groupData: this.groupDetails,
                  propertyUnitId: this.propertyUnitId,
                  reservation: reservationDetails[0],
                })
                .then((response) => {
                  console.log(response);
                  this.alertService.successAlert(response.message); // Success alert
                  this.ngOnInit(); // Refresh the component (Consider optimizing if performance is slow)
                })
                .catch((error) => {
                  this.alertService.errorAlert(
                    error?.error?.message ||
                      'An error occurred while processing the room addition'
                  );
                  console.error(error);
                });
            }
          });
      })
      .catch((error: any) => {
        this.alertService.errorAlert(
          error?.error?.message || 'Failed to fetch room rates'
        );
      });
  }

  // Process room data and add dropdown settings
  private processRoomsData(data: any[]): void {
    this.roomsData = data.map((room) => {
      room.dropdownSettings = {
        singleSelection: false,
        limitSelection: 0, // Start with no limit
        idField: 'id',
        textField: 'roomName',
        unSelectAllText: 'UnSelect All',
        enableCheckAll: false,
        itemsShowLimit: 3,
        allowSearchFilter: true,
      };
      room.extraAdults = 0;
      room.extraChilds = 0;
      [room.roomPrice, room.roomCost] = this.calculateRoomCost(room); // Calculate room price and cost
      if (!this.roomTypeRooms[room.roomTypeId]) {
        this.roomTypeRooms[room.roomTypeId] = room.rooms;
      }
      this.selectedItems.push([]); // Prepare an empty selection for each room
      return room;
    });
  }

  // Calculate room cost based on rates and extra occupants
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

  // Add room count and update the selection settings
  addRoomCount(index: number): void {
    this.currentRoomCount += 1;
    this.updateRoomSelection(index, 1); // Increase room selection
  }

  // Remove room count and update the selection settings
  removeRoomCount(index: number): void {
    this.currentRoomCount -= 1;
    this.updateRoomSelection(index, -1); // Decrease room selection
  }

  // Update room selection and manage limits
  private updateRoomSelection(index: number, increment: number): void {
    const room = this.roomsData[index];
    room.dropdownSettings = Object.assign({}, room.dropdownSettings, {
      limitSelection: room.dropdownSettings.limitSelection + increment, // Adjust selection limit
    });

    // Adjust total rooms for similar room types
    this.roomsData.forEach((element: any, i: number) => {
      if (i !== index && element.roomTypeId === room.roomTypeId) {
        element.totalRoom -= increment;
      }
    });

    // Adjust selected items when rooms are removed and limit is exceeded
    if (
      increment < 0 &&
      this.selectedItems[index].length > room.dropdownSettings.limitSelection
    ) {
      let x = [...this.selectedItems[index]];
      x.splice(x.length - 1, 1);
      this.selectedItems[index] = Object.assign(x);
    }
  }

  // Prepare reservation details to be submitted to the server
  private prepareReservationDetails(): any[] {
    return this.roomsData.reduce((acc: any[], room: any, index: number) => {
      if (room.dropdownSettings.limitSelection > 0) {
        const roomDetails = this.createRoomDetails(room, index);
        return acc.concat(roomDetails);
      }
      return acc;
    }, []);
  }

  // Create room details based on user selection and unassigned rooms
  private createRoomDetails(room: any, index: number): any[] {
    const selectedRooms = this.selectedItems[index].map(
      (selectedRoom: any) => ({
        ...room,
        room,
        roomId: selectedRoom.id,
      })
    );

    // Handle unassigned rooms
    const unassignedRooms = Array(
      room.dropdownSettings.limitSelection - selectedRooms.length
    ).fill({
      ...room,
      roomId: 'assign',
      room: {
        id: 'assign',
        roomStatus: 'vacant',
        roomCondition: 'clean',
        roomNumber: 'default',
        roomName: 'default',
      },
    });

    return selectedRooms.concat(unassignedRooms);
  }

  // Filter available rooms for dropdown (to avoid already selected ones)
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
        this.processRoomsData(response.data); // Reuse processRoomsData function
        this.modalService.open(content, {
          size: 'lg',
          centered: true,
          backdrop: 'static',
          keyboard: false,
        });
      })
      .catch((error: any) => {
        this.alertService.errorAlert(
          error?.error?.message || 'Failed to fetch room rates'
        );
      });
  }

  callChangeRoom(newReservation: any, room: any): void {
    newReservation.room = room;
    newReservation.roomId = room.id;

    this.crudService
      .post(APIConstant.CHANGE_ROOM, {
        groupData: {
          groupId: this.groupDetails._id,
          arrival: this.groupDetails.arrival,
          departure: this.groupDetails.departure,
        },
        propertyUnitId: this.propertyUnitId,
        reservation: newReservation,
        oldReservation: this.currentReservation,
      })
      .then((response) => {
        console.log(response);
        this.modalService.dismissAll();
        this.alertService.successAlert(response.message);
        this.ngOnInit(); // Refresh the component
      })
      .catch((error) => {
        this.alertService.errorAlert(
          error?.error?.message || 'An error occurred while changing the room'
        );
        console.error(error);
      });
  }

  showRoomCharges(reservation: any): void {
    reservation.showCharges =
      reservation.showCharges == undefined || reservation.showCharges == false
        ? true
        : false;
  }

  openAddChargeModal(content: any, reservation: any): void {
    this.postChargeForm.patchValue({
      groupId: reservation.groupId,
      reservationId: reservation._id,
      charge: 10,
      description: '',
    });

    this.modalService
      .open(content, {
        size: 'lg',
        centered: true,
        backdrop: 'static',
        keyboard: false,
      })
      .result.then((result) => {
        if (result) {
          this.crudService
            .post(APIConstant.ADD_RESERVATION_CHARGE, {
              propertyUnitId: this.propertyUnitId,
              groupId: this.groupId,
              charges: this.postChargeForm.value,
            })
            .then((response) => {
              console.log(response);
              this.alertService.successAlert(response.message);
              this.ngOnInit();
            })
            .catch((error) => {
              this.alertService.errorAlert(
                error?.error?.message ||
                  'An error occurred while adding charges'
              );
              console.error(error);
            });
        }
      });
  }

  openPaymentModal(content: any): void {
    const amount = this.groupDetails.totalBalance
      ? -this.groupDetails.totalBalance
      : 10;

    this.paymentForm.patchValue({
      groupId: this.groupId,
      paymentType: 'cash',
      amount: amount,
      deposit: false,
      remark: '',
    });

    this.modalService
      .open(content, {
        size: 'lg',
        centered: true,
        backdrop: 'static',
        keyboard: false,
      })
      .result.then((result) => {
        if (result) {
          this.crudService
            .post(APIConstant.POST_RESERVATION_PAYMENT, {
              payment: this.paymentForm.value,
              userId: this.groupDetails.customerId,
              propertyUnitId: this.propertyUnitId,
              groupId: this.groupId,
            })
            .then((response) => {
              console.log(response);
              this.alertService.successAlert(response.message);
              this.ngOnInit();
            })
            .catch((error) => {
              this.alertService.errorAlert(
                error?.error?.message || 'An error occurred '
              );
              console.error(error);
            });
        }
      });
  }

  openRefundModal(content: any): void {
    const s = this.groupDetails?.paymentDetails.reduce(
      (acc: Number, curr: any) => {
        if (!curr.isDeposit && curr?.transactionDetails?.transactionRate > 0) {
          acc = acc + curr?.transactionDetails?.transactionRate;
        }
        return acc;
      },
      0
    );
    console.log(s);
    if (s > 0) {
      this.refundForm.patchValue({
        groupId: this.groupId,
        paymentType: 'cash',
        amount: 0,
        maxRefund: s,
        remark: '',
      });

      this.modalService
        .open(content, {
          size: 'lg',
          centered: true,
          backdrop: 'static',
          keyboard: false,
        })
        .result.then((result) => {
          if (result) {
            this.crudService
              .post(APIConstant.REFUND_PAYMENT, {
                payment: this.refundForm.value,
                userId: this.groupDetails.customerId,
                propertyUnitId: this.propertyUnitId,
                groupId: this.groupId,
              })
              .then((response) => {
                console.log(response);
                this.alertService.successAlert(response.message);
                this.ngOnInit();
              })
              .catch((error) => {
                this.alertService.errorAlert(
                  error?.error?.message || 'An error occurred '
                );
                console.error(error);
              });
          }
        });
    }
  }

  readNoshowCharge(reservation: any): void {
    this.crudService
      .post(APIConstant.READ_NOSHOW_CHARGE, {
        propertyUnitId: this.propertyUnitId,
        reservationId: reservation._id,
      })
      .then((response) => {
        console.log(response);
        this.noshowDetails = response.data;
        this.modalService
          .open(this.noshowReservationModal, {
            size: 'lg',
            centered: true,
            backdrop: 'static',
            keyboard: false,
          })
          .result.then((result) => {
            if (result) {
              this.crudService
                .post(APIConstant.NOSHOW_RESERVATION, {
                  noshowDetails: this.noshowDetails,
                  reservation: reservation,
                  propertyUnitId: this.propertyUnitId,
                })
                .then((response) => {
                  console.log(response);
                  this.alertService.successAlert(response.message);
                  this.ngOnInit();
                })
                .catch((error) => {
                  this.alertService.errorAlert(
                    error?.error?.message ||
                      'An error occurred while processing no-show'
                  );
                  console.error(error);
                });
            }
          });
        this.alertService.successAlert(response.message);
      })
      .catch((error) => {
        this.alertService.errorAlert(
          error?.error?.message || 'Failed to retrieve no-show charges'
        );
        console.error(error);
      });
  }

  readCancelCharge(reservation: any): void {
    this.crudService
      .post(APIConstant.READ_CANCEL_RESERVATION_CHARGE, {
        propertyUnitId: this.propertyUnitId,
        reservationId: reservation._id,
      })
      .then((response) => {
        console.log(response);
        this.cancelDetails = response.data;
        this.modalService
          .open(this.cancelReservationModal, {
            size: 'lg',
            centered: true,
            backdrop: 'static',
            keyboard: false,
          })
          .result.then((result) => {
            if (result) {
              this.crudService
                .post(APIConstant.CANCEL_RESERVATION, {
                  cancelDetails: this.cancelDetails,
                  reservation: reservation,
                  propertyUnitId: this.propertyUnitId,
                })
                .then((response) => {
                  console.log(response);
                  this.alertService.successAlert(response.message);
                  this.ngOnInit();
                })
                .catch((error) => {
                  this.alertService.errorAlert(
                    error?.error?.message ||
                      'An error occurred while canceling the reservation'
                  );
                  console.error(error);
                });
            }
          });
        this.alertService.successAlert(response.message);
      })
      .catch((error) => {
        this.alertService.errorAlert(
          error?.error?.message || 'Failed to retrieve cancellation charges'
        );
        console.error(error);
      });
  }

  openGuestForm(
    content: any,
    reservationId: any,
    isDeleteAble = false,
    guest?: any,
    address?: any
  ): void {
    this.guestForm = this.fb.group({
      _id: [guest?._id || ''],
      firstName: [
        guest?.firstName || '',
        [Validators.required, Validators.minLength(2)],
      ],
      lastName: [
        guest?.lastName || '',
        [Validators.required, Validators.minLength(2)],
      ],
      email: [guest?.email || '', [Validators.required, Validators.email]],
      phone: [guest?.phone || ''],
      addressLine1: [address?.addressLine1 || ''],
      addressLine2: [address?.addressLine2 || ''],
      country: [address?.country || ''],
      city: [address?.city || ''],
      state: [address?.state || '', [Validators.pattern(/^[A-Za-z\s]+$/)]],
      zipCode: [address?.zipCode || ''],
      documents: [guest?.documents || []],
      isCustomer: [isDeleteAble],
    });

    this.modalService
      .open(content, {
        size: 'lg',
        centered: true,
        backdrop: 'static',
        keyboard: false,
      })
      .result.then((result) => {
        if (result === 'delete') {
          this.deleteGuest(reservationId);
        } else if (result) {
          this.saveGuest(reservationId);
        }
      });
  }

  private deleteGuest(reservationId: any): void {
    this.crudService
      .post(APIConstant.DELETE_SHARED_GUEST, {
        reservationId: reservationId,
        groupId: this.groupId,
        userDetails: this.guestForm.value,
        propertyUnitId: this.propertyUnitId,
      })
      .then((response) => {
        console.log(response);
        this.alertService.successAlert(response.message);
        this.ngOnInit();
      })
      .catch((error) => {
        this.alertService.errorAlert(
          error?.error?.message || 'An error occurred while deleting the guest'
        );
        console.error(error);
      });
  }

  private saveGuest(reservationId: any): void {
    const callUrl = this.guestForm.get('_id')?.value
      ? APIConstant.UPDATE_GUEST_RESERVATION
      : APIConstant.ADD_SHARED_GUEST_RESERVATION;

    this.crudService
      .post(callUrl, {
        reservationId: reservationId,
        groupId: this.groupId,
        userDetails: this.guestForm.value,
        propertyUnitId: this.propertyUnitId,
      })
      .then((response) => {
        console.log(response);
        this.alertService.successAlert(response.message);
        this.ngOnInit();
      })
      .catch((error) => {
        this.alertService.errorAlert(
          error?.error?.message || 'An error occurred '
        );
        console.error(error);
      });
  }

  dropped(files: NgxFileDropEntry[], guestForm: AbstractControl) {
    this.files = files;

    // Create a single FormData object for all files
    const formData = new FormData();

    for (const droppedFile of files) {
      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;

        fileEntry.file((file: File) => {
          // Append each file to the FormData
          formData.append('uploadedImages', file, droppedFile.relativePath);

          // After all files have been processed, send the request
          if (files.indexOf(droppedFile) === files.length - 1) {
            formData.append('userId', guestForm.get('_id')?.value);

            this.uploadPhotos(formData, guestForm);
          }
        });
      } else {
        // It was a directory (handle directories if necessary)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
        console.log(droppedFile.relativePath, fileEntry);
      }
    }
  }

  uploadPhotos(formData: FormData, guestForm: AbstractControl) {
    this.crudService
      .post(APIConstant.UPLOAD_RESERVATION_IMAGES, formData)
      .then((response) => {
        if (response?.data?.images?.length) {
          guestForm.patchValue({
            documents: [
              ...guestForm.get('documents')?.value,
              ...response?.data?.images,
            ],
          });
        }
      })
      .catch((error) => {
        this.alertService.errorAlert(
          error?.error?.message || 'An error occurred '
        );
        console.error(error);
      });
  }

  deletePhotos(imageUrl: any) {
    this.crudService
      .post(APIConstant.DELETE_RESERVATION_IMAGES, {
        imageUrl,
        userId: this.guestForm?.get('_id')?.value,
      })
      .then((response) => {
        let originalArray = this.guestForm?.get('documents')?.value;
        const indexToRemove = originalArray.indexOf(imageUrl);
        if (indexToRemove !== -1) {
          originalArray.splice(indexToRemove, 1);
        }
        this.guestForm.patchValue({ documents: originalArray });
      })
      .catch((error) => {
        this.alertService.errorAlert(
          error?.error?.message || 'An error occurred '
        );
        console.error(error);
      });
  }

  openCheckInModal(content: any, reservation: any): void {
    if (reservation.tentative) {
      this.alertService.errorAlert('Please Assign Room');
    } else {
      this.confirmMsg = 'Are you sure want to check in ?';
      this.modalService.open(content).result.then((result) => {
        if (result) {
          this.crudService
            .post(APIConstant.CHECKIN_RESERVATION, {
              propertyUnitId: this.propertyUnitId,
              groupId: this.groupId,
              reservationId: reservation._id,
            })
            .then((response) => {
              console.log(response);
              this.alertService.successAlert(response.message);
              this.ngOnInit();
            })
            .catch((error) => {
              this.alertService.errorAlert(
                error?.error?.message ||
                  'An error occurred while adding charges'
              );
              console.error(error);
            });
        }
      });
    }
  }
  openCheckOutModal(content: any, reservation: any): void {
    this.confirmMsg = 'Are you sure want to check out ?';
    this.modalService.open(content).result.then((result) => {
      if (result) {
        this.crudService
          .post(APIConstant.CHECKOUT_RESERVATION, {
            propertyUnitId: this.propertyUnitId,
            groupId: this.groupId,
            reservation: reservation,
          })
          .then((response) => {
            console.log(response);
            this.alertService.successAlert(response.message);
            this.ngOnInit();
          })
          .catch((error) => {
            this.alertService.errorAlert(
              error?.error?.message || 'An error occurred while adding charges'
            );
            console.error(error);
          });
      }
    });
  }

  openDepositModal(content: any, deposit: any): void {
    deposit.transactionDetails.refundAmount =
      deposit.transactionDetails.transactionRate;
    deposit.transactionDetails.captureAmount =
      deposit.transactionDetails.transactionRate;
    this.depositObj = deposit;
    this.modalService.open(content).result.then((result) => {
      if (result) {
        this.crudService
          .post(APIConstant.DEPOSIT_RELEASE, {
            propertyUnitId: this.propertyUnitId,
            groupId: this.groupId,
            deposit: this.depositObj,
          })
          .then((response) => {
            console.log(response);
            this.alertService.successAlert(response.message);
            this.ngOnInit();
          })
          .catch((error) => {
            this.alertService.errorAlert(
              error?.error?.message || 'An error occurred while adding charges'
            );
            console.error(error);
          });
      }
    });
  }
  unassignRoom() {
    this.crudService
      .post(APIConstant.UNASSIGN_ROOM, {
        propertyUnitId: this.propertyUnitId,
        groupId: this.groupId,
        reservation: this.currentReservation,
      })
      .then((response) => {
        console.log(response);
        this.alertService.successAlert(response.message);
        this.ngOnInit();
      })
      .catch((error) => {
        this.alertService.errorAlert(
          error?.error?.message || 'An error occurred '
        );
        console.error(error);
      });
  }
}
