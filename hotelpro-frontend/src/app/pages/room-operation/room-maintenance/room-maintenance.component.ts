import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { APIConstant } from '../../../core/constants/APIConstant';
import { AlertService } from '../../../core/services/alert.service';
import { CrudService } from '../../../core/services/crud.service';
import { CommonModule, DatePipe } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-room-maintenance',
  standalone: true,
  imports: [FormsModule, NgMultiSelectDropDownModule, CommonModule, ReactiveFormsModule],
  templateUrl: './room-maintenance.component.html',
  styleUrl: './room-maintenance.component.css',
})
export class RoomMaintenanceComponent {
  propertyUnitId: string | null = '';
  RoomData: any;
  StartDate!: Date;
  EndDate!: Date;
  ShowAdd = false;
  DateArr: any;
  Date: any;
  Week = 2;
  PropertyUnitName = '';
  PropertyUnitCode = '';

  ShowMain = false;
  CompletedBy = '';
  dropdownSettings!: {
    singleSelection: boolean;
    idField: string;
    textField: string;
    unSelectAllText: string;
    enableCheckAll: boolean;
    itemsShowLimit: number;
    allowSearchFilter: boolean;
  };
  dropdownListRoom: any = [];
  dropdownSettingsRooms!: {
    singleSelection: boolean;
    idField: string;
    textField: string;
    unSelectAllText: string;
    enableCheckAll: boolean;
    itemsShowLimit: number;
    allowSearchFilter: boolean;
  };
  dropdownList: any = [];
  selectedItems: any = [];
  CurrentMaintainance: any;
  AddMaintenance: any;
  RoomTypes!: any[];
  ShowEdit = false;
  RoomAfterMaintainance: any;
  Max!: any;
  Handicapped = false;
  Smoking = false;
  availableRoom: any;
  Today!: any;
  userData: any;
  RangeUpdate!: FormGroup;
  AccesstoBlockroom = false;
  constructor(
    // private _ModalService: NgbModal,
    private crudService: CrudService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.dropdownListRoom = [];
    this.propertyUnitId =
      this.activeRoute.snapshot.paramMap.get('propertyUnitId');

    this.Max = new DatePipe('en-US').transform(new Date(), 'yyyy-MM-dd');
    this.ShowAdd = false;

    let date = new Date();
    this.Date = new DatePipe('en-US').transform(date, 'yyyy-MM-dd');
    this.Today = new DatePipe('en-US').transform(date, 'yyyy-MM-dd');
    this.StartDate = new Date();

    this.RangeUpdate = new FormGroup({
      StartDate: new FormControl(this.Today, Validators.required),
      EndDate: new FormControl(this.Today, Validators.required),
      Room: new FormControl('all', Validators.required),
      RoomType: new FormControl('all', Validators.required),
      CompletedBy: new FormControl(''),
    });
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      unSelectAllText: 'UnSelect All',
      enableCheckAll: false,
      itemsShowLimit: 2,
      allowSearchFilter: true,
    };
    this.dropdownSettingsRooms = {
      singleSelection: false,
      idField: 'item_id',
      textField: 'item_text',
      unSelectAllText: 'UnSelect All',
      enableCheckAll: true,
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };
    this.AddMaintenance = new FormGroup({
      PropertyUnitId: new FormControl(
        this.userData.data.user.PropertyUnitId[0]
      ),
      StartDate: new FormControl('', Validators.required),
      EndDate: new FormControl('', Validators.required),
      RoomType: new FormControl('', Validators.required),
      Rooms: new FormControl([], Validators.required),
      OnlyMaintenance: new FormControl(true),
      Reason: new FormControl('', Validators.required),
      Notes: new FormControl(''),
      email: new FormControl(''),
    });
    this.fetchdata();
  }

  setBackground(r: any) {
    if (r.ReservationStatus == 'Reserved') {
      return 'reservation';
    } else if (r.ReservationStatus == 'In house') {
      return 'inhouse';
    } else if (r.ReservationStatus == 'Checked out') {
      return 'checkedout';
    }
    return '';
  }

  getAvailRoomdata() {
    if (
      this.AddMaintenance.controls.StartDate.value != '' &&
      this.AddMaintenance.controls.EndDate.value != ''
    ) {
      this.crudService
        .post(APIConstant.READ_PROPERTY_UNIT, {
          StartDate: this.AddMaintenance.controls.StartDate.value,
          EndDate: this.AddMaintenance.controls.EndDate.value,
          PropertyUnitId: this.userData.data.user.PropertyUnitId[0],
        })
        .then((response: any) => {
          this.availableRoom = response.data.RoomTypes;
        })
        .catch((error) => {
          this.alertService.errorAlert(error.message);
        });
    }
  }

  showRooms(event: any) {
    for (let i of this.availableRoom) {
      if (i._id == event.target.value) {
        this.dropdownListRoom = [];
        this.AddMaintenance.controls['Rooms'].setValue([]);
        for (let x of i.rooms) {
          let obj = {
            item_id: x._id,
            item_text: x.RoomName,
          };
          this.dropdownListRoom.push(obj);
        }
        break;
      }
    }
  }

  fetchdata() {
    this.AddMaintenance.reset();
    this.AddMaintenance.controls.OnlyMaintenance.setValue(true);
    this.ShowAdd = false;
    this.StartDate = new Date(this.Date);
    this.EndDate = new Date(this.StartDate.getDate() + this.Week * 7);
    this.DateArr = [];
    for (
      let d = new Date(this.StartDate);
      d < this.EndDate;
      d.setDate(d.getDate() + 1)
    ) {
      this.DateArr.push(new Date(d));
    }

    this.crudService
      .post(APIConstant.READ_ROOM_MAINTENANCE, {
        StartDate: this.StartDate,
        EndDate: this.EndDate,
        PropertyUnitId: this.userData.data.user.PropertyUnitId[0],
      })
      .then((response: any) => {
        this.dropdownList = [];
        this.RoomData = response.data.Rooms;

        for (let r of this.RoomData) {
          for (let rr of r.Reservation) {
            rr.Arrival = new Date(
              rr.Arrival.split('T')[0].replace(/-/g, '/') + ' 00:00'
            );
            rr.Departure = new Date(
              rr.Departure.split('T')[0].replace(/-/g, '/') + ' 00:00'
            );
          }
          for (let rm of r.RoomMaintainance) {
            rm.StartDate = new Date(
              rm.StartDate.split('T')[0].replace(/-/g, '/') + ' 00:00'
            );
            rm.EndDate = new Date(
              rm.EndDate.split('T')[0].replace(/-/g, '/') + ' 00:00'
            );
          }
          if (!this.dropdownList.includes(r.RoomType)) {
            this.dropdownList.push(r.RoomType);
          }
          r.Show = true;
        }
        this.RoomTypes = [...this.dropdownList];
        this.dropdownList = this.dropdownList.map((e: any) => {
          return { item_id: e, item_text: e };
        });
      })
      .catch((error) => {
        this.alertService.errorAlert(error.statusMessage);
      });
  }

  add() {
    this.Week += 1;
  }

  sub() {
    if (this.Week > 2) {
      this.Week -= 1;
    }
  }

  test(d: any, r: any) {
    if (
      d.toString() == r.Arrival.toString() ||
      (r.Arrival <= this.StartDate && d.toString() == this.StartDate.toString())
    ) {
      return true;
    } else {
      return false;
    }
  }

  showAddpop() {
    this.ShowMain = false;
    this.ShowAdd = true;
    this.ShowEdit = false;
  }

  cancelpop() {
    this.ShowAdd = false;
    this.ShowEdit = false;
  }

  testmaintainance(d: any, m: any) {
    if (
      d.toString() == m.StartDate.toString() ||
      (m.StartDate <= this.StartDate &&
        d.toString() == this.StartDate.toString())
    ) {
      return true;
    } else {
      return false;
    }
  }

  nightNumber(a: any, d: any) {
    let date1 = new Date(a);
    let date2 = new Date(d);
    let en = new Date(this.EndDate);
    let st = new Date(this.StartDate);
    st.setUTCHours(0, 0, 0, 0);
    en.setUTCHours(0, 0, 0, 0);
    date1.setUTCHours(0, 0, 0, 0);
    date2.setUTCHours(0, 0, 0, 0);

    let z = 0;
    if (date1 < st) {
      if (date2 > en) {
        z = Math.abs(date2.getTime() - en.getTime());
        z = Math.round(z / (24 * 60 * 60 * 1000));
        z += 0.3;
      }
      if (date2.toString() == en.toString()) {
        z = 0.3;
      }

      let di = (st.getTime() - date1.getTime()) / (24 * 60 * 60 * 1000);
      let diff = (date2.getTime() - date1.getTime()) / (24 * 60 * 60 * 1000);
      // this.nightnumber = diff;
      return diff - di - z >= 1 ? diff - di - z : 0.7;
    }

    if (date2 > en) {
      z = Math.abs(date2.getTime() - en.getTime());
      z = Math.round(z / (1000 * 3600 * 24));
      z += 0.3;
    }
    if (date2.toString() == en.toString()) {
      z = 0.3;
    }
    let diff = Math.round(
      (date2.getTime() - date1.getTime()) / (1000 * 3600 * 24)
    );
    // this.nightnumber = diff;

    return diff - z >= 1 ? diff - z : 0.7;
  }
  
  filterRoom() {
    let r = this.selectedItems.map((e: any) => e.item_id);
    if (r.length > 0) {
      for (let t of this.RoomData) {
        if (r.includes(t.RoomType)) {
          t.Show = true;
        } else {
          t.Show = false;
        }
      }
    } else {
      for (let t of this.RoomData) {
        t.Show = true;
      }
    }
  }

  maintainance(m: any) {
    this.ShowAdd = false;
    this.ShowMain = true;
    this.ShowEdit = false;
    this.CurrentMaintainance = { ...m };
    this.CurrentMaintainance.StartDate = new DatePipe('en-US').transform(
      new Date(this.CurrentMaintainance.StartDate),
      'yyyy-MM-dd'
    );
    this.CurrentMaintainance.EndDate = new DatePipe('en-US').transform(
      new Date(this.CurrentMaintainance.EndDate),
      'yyyy-MM-dd'
    );
  }

  addMaintenance() {
    let formdata = this.AddMaintenance.value;
    formdata.PropertyUnitId = this.userData.data.user.PropertyUnitId[0];
    let diff = Math.round(
      (new Date(formdata.EndDate).getTime() -
        new Date(formdata.StartDate).getTime()) /
        (1000 * 3600 * 24)
    );
    let objarr: any[] = [];
    if (new Date(formdata.EndDate) < new Date(formdata.StartDate)) {
      this.alertService.errorAlert('Enter Valid Start and End Date!');
    } else {
      for (let i of formdata.Rooms) {
        let obj = {
          PropertyUnitId: formdata.PropertyUnitId,
          StartDate: formdata.StartDate,
          EndDate: formdata.EndDate,
          RoomId: i.item_id,
          budget: 0,
          DurationDays: diff,
          Reason: formdata.Reason,
          Notes: formdata.Notes,
          email: formdata.email,
          Completed: false,
          OnlyMaintenance: formdata.OnlyMaintenance,
          Today: this.Today,
          clientMailIdFlag: false,
          clientId: this.userData.data.user._id,
        };
        if (formdata.email == null) {
          obj.email = this.userData.data.user.Email;
          obj.clientMailIdFlag = true;
        }
        objarr.push(obj);
      }

      this.crudService
        .post(APIConstant.CREATE_ROOM_MAINTENANCE, { RoomMaintainance: objarr })
        .then((response: any) => {
          for (let r of objarr) {
            delete r.PropertyUnitId;
            delete r.RoomId;
            delete r.Notes;
            delete r.email;
            // delete r.budget;
          }

          this.fetchdata();
        })
        .catch((error) => {
          this.alertService.errorAlert(error.message);
        });
    }
  }

  Cancelupdate() {
    this.ShowMain = false;
    this.CompletedBy = '';
  }
  
  updateMaintenance() {
    if (
      new Date(this.Today) >=
      new Date(this.CurrentMaintainance.StartDate)
    ) {
      this.CurrentMaintainance.Completed = true;
      this.CurrentMaintainance.CompletedBy = this.CompletedBy;
      let x = new Date(this.Today);
      x.setUTCHours(0, 0, 0, 0);
      this.CurrentMaintainance.EndDate = new Date(x);
      this.CurrentMaintainance.RoomMaintainanceId =
        this.CurrentMaintainance._id;
      this.CurrentMaintainance.Today = this.Today;

      this.crudService
        .post(APIConstant.UPDATE_ROOM_MAINTENANCE, this.CurrentMaintainance)
        .then((response: any) => {
          this.alertService.errorAlert(
            'Mark as Complete and Room Condition is ' +
              this.RoomAfterMaintainance
          );
          this.CompletedBy = '';
          this.fetchdata();
        })
        .catch((error) => {
          this.alertService.errorAlert(error.message);
        });
    } else {
      this.alertService.errorAlert(
        'You can not complete maintainance becouse it is not started yet!'
      );
    }
  }

  async updateMaintenance2() {
    let date = new Date();
    date.setDate(date.getDate() + 1);

    this.CurrentMaintainance.RoomMaintainanceId = this.CurrentMaintainance._id;
    let today = new Date(date);
    today.setHours(0, 0, 0, 0);
    let st = new Date(this.CurrentMaintainance.StartDate);
    st.setHours(0, 0, 0, 0);
    let ed = new Date(this.CurrentMaintainance.EndDate);
    ed.setHours(0, 0, 0, 0);
    if (
      new Date(this.CurrentMaintainance.StartDate) >
      new Date(this.CurrentMaintainance.EndDate)
    ) {
      this.alertService.errorAlert('Enter Valid Start and End Date!');
    } else if (st < today && ed < today) {
      this.alertService.errorAlert('Enter Valid Start and End Date!');
    } else {
      this.CurrentMaintainance.Today = this.Today;
      this.crudService
        .post(APIConstant.UPDATE_ROOM_MAINTENANCE, this.CurrentMaintainance)
        .then((response: any) => {
          this.alertService.errorAlert('room Maintainance updated Successfully!');
          this.CompletedBy = '';
          this.fetchdata();
        })
        .catch((error) => {
          this.alertService.errorAlert(error.message);
        });
    }
  }

  showEdit() {
    this.ShowMain = false;
    this.ShowAdd = false;
    this.ShowEdit = true;
  }

  next() {
    let scroll = document.getElementById('scroll');
    scroll?.scrollBy(665, 0);
  }

  prev() {
    let scroll = document.getElementById('scroll');
    scroll?.scrollBy(-665, 0);
  }

  back() {
    window.history.back();
  }

  openModal_sm(content: any) {
    // this._ModalService.open(content, { centered: true });
  }

  rangeUpdate() {
    let obj = this.RangeUpdate.value;
    obj.Completed = true;
    // obj.CompletedBy = this.CompletedBy;
    let x = new Date(this.Today);
    x.setUTCHours(0, 0, 0, 0);
    obj.EndDateToUpdate = new Date(x);
    obj.PropertyUnitId = this.userData.data.user.PropertyUnitId[0];

    this.crudService
        .post(APIConstant.UPDATE_ROOM_MAINTENANCE_RANGE, obj)
        .then((response: any) => {
          this.alertService.errorAlert('Room maintainance updated Successfully!');
          this.ngOnInit();
        })
        .catch((error) => {
          this.alertService.errorAlert(error.message);
        });
  }
}
