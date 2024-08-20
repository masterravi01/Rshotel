import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormArray,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';
import { CrudService } from '../../../core/services/crud.service';
import { CommonModule, DatePipe } from '@angular/common';
import { APIConstant } from '../../../core/constants/APIConstant';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';


@Component({
  selector: 'app-house-keeping',
  standalone: true,
  imports: [
    FormsModule,
    NgMultiSelectDropDownModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './house-keeping.component.html',
  styleUrl: './house-keeping.component.css'
})
export class HouseKeepingComponent implements OnInit {
  propertyUnitId: string | null = '';
  RoomDetails: any;
  CurrentRemark: any;
  CurrentRemarkIndex: any;
  SearchText: any;
  RoomTypes: any;
  Start: number = 0;
  End: number = 0;
  SelectRoomType = 'all';
  SelectCondition = 'dirty';
  Flag = false;
  isEditable = false;
  SelectRoom = '';
  HouseKeeperForm!: FormGroup;
  Schedules = false;

  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private modalService: NgbModal,
  ) {}

  ngOnInit() {
    
    this.propertyUnitId =
    this.activeRoute.snapshot.paramMap.get('propertyUnitId');
    this.isEditable = false;

    this.crudService
      .post(APIConstant.READ_ROOMS_WITH_HOUSE_KEEPING, {
        propertyUnitId: this.propertyUnitId,
      })
      .then((response: any) => {
        this.RoomDetails = response.data.RoomDetails;
        this.RoomTypes = [...new Set(this.RoomDetails.map((room: any) => room.roomType))]; // Find unique room type from all rooms
      })
      .catch((error) => {
        this.alertService.errorAlert(error.statusMessage);
      });

      this.HouseKeeperForm = this.fb.group({
        propertyUnitId: [this.propertyUnitId],
        LanguagePreference: ('English'),
        firstName: ['', [
          Validators.required,
          Validators.pattern("^[a-zA-Z.'\\s]*$"),
        ]],
        lastName: ['', [
          Validators.required,
          Validators.pattern("^[a-zA-Z.'\\s]*$"),
        ]],
        Notes: [''],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required]],
        Schedule: this.fb.array([
          this.createScheduleGroup('MONDAY', true),
          this.createScheduleGroup('TUESDAY', true),
          this.createScheduleGroup('WEDNESDAY', true),
          this.createScheduleGroup('THURSDAY', true),
          this.createScheduleGroup('FRIDAY', true),
          this.createScheduleGroup('SATURDAY', false),
          this.createScheduleGroup('SUNDAY', false),
        ]),
      });
  }

  get Schedule(): FormArray {
    return this.HouseKeeperForm.get('Schedule') as FormArray;
  }

  createScheduleGroup(day: string, working: boolean): FormGroup {
    return this.fb.group({
      Day: [day],
      ShiftStartTime: ['12:00'],
      ShiftEndTime: ['00:00'],
      Working: [working],
    });
  } 

  addHouseKeeper() {
    let housekeeper = this.HouseKeeperForm.value;
    housekeeper.propertyUnitId = this.propertyUnitId;
    let working = false;
    for (let s of housekeeper.Schedule) {
      if (s.Working) {
        working = true;
      }
      let d = new Date();
      d.setHours(
        s.ShiftEndTime.split(':')[0],
        s.ShiftEndTime.split(':')[1],
        0,
        0
      );
      let d2 = new Date();
      d2.setHours(
        s.ShiftStartTime.split(':')[0],
        s.ShiftStartTime.split(':')[1],
        0,
        0
      );

      s.ShiftEndTime = d.getHours() + ':' + d.getMinutes();
      s.ShiftStartTime = d2.getHours() + ':' + d2.getMinutes();
    }
    if (working) {
      this.crudService
      .post(APIConstant.READ_ROOMS_WITH_HOUSE_KEEPING, {
        housekeeper,
      })
      .then((response: any) => {
        this.alertService.successAlert('Housekeeper added Successfully!');
        this.ngOnInit();
        this.modalService.dismissAll();
      })
      .catch((error) => {
        this.alertService.errorAlert(error?.error?.statusMessage);
      });
    } else {
      this.alertService.errorAlert('Please add valid Schedule!');
    }
  }

  show_Schedule() {
    this.Schedules = !this.Schedules;
  }
  
  editbtn() {
    this.isEditable = true;
  }

  changeCondition(conditon: any, i: any) {
    console.log(conditon);
    this.RoomDetails[i].roomCondition = conditon;
    this.RoomDetails[i].Changed = true;
  }

  rangeUpdate() {
    let rd = [];
    if (this.Start > 0 && this.End > 0 && this.Start < this.End) {
      this.Flag = false;
      if (this.SelectRoomType == 'all') {
        for (let d of this.RoomDetails) {
          if (
            Number(d.roomNumber) >= this.Start &&
            Number(d.roomNumber) <= this.End
          ) {
            if (this.SelectRoom == 'even' && Number(d.roomNumber) % 2 == 0) {
              d.Changed = true;
              d.roomCondition = this.SelectCondition;
              rd.push(d);
            } else if (
              this.SelectRoom == 'odd' &&
              Number(d.roomNumber) % 2 != 0
            ) {
              d.Changed = true;
              d.roomCondition = this.SelectCondition;
              rd.push(d);
            } else if (this.SelectRoom == 'all') {
              d.Changed = true;
              d.roomCondition = this.SelectCondition;
              rd.push(d);
            }
          }
        }
      } else {
        for (let d of this.RoomDetails) {
          if (
            Number(d.roomNumber) >= this.Start &&
            Number(d.roomNumber) <= this.End &&
            d.roomType == this.SelectRoomType
          ) {
            if (this.SelectRoom == 'even' && Number(d.roomNumber) % 2 == 0) {
              d.Changed = true;
              d.roomCondition = this.SelectCondition;
              rd.push(d);
            } else if (
              this.SelectRoom == 'odd' &&
              Number(d.roomNumber) % 2 != 0
            ) {
              d.Changed = true;
              d.roomCondition = this.SelectCondition;
              rd.push(d);
            } else if (this.SelectRoom == 'all') {
              d.Changed = true;
              d.roomCondition = this.SelectCondition;
              rd.push(d);
            }
          }
        }
      }
      this.modalService.dismissAll();
    } else {
      this.Flag = true;
    }
  }

  updateRooms() {
    let rd = this.RoomDetails.filter((e: any) => {
      if (e.Changed) {
        return true;
      } else {
        return false;
      }
    });
    this.crudService
      .post(APIConstant.UPDATE_ROOMS_WITH_HOUSE_KEEPING, {
        propertyUnitId: this.propertyUnitId,
        RoomDetails: rd,
      })
      .then((response: any) => {
        for (let r of rd) {
          delete r._id;
          delete r.Show;
        }
        this.ngOnInit();
      })
      .catch((error) => {
        this.alertService.errorAlert(error.statusMessage);
      });
  }

  openModalRemark(content: any, item: any, i: any) {
    this.CurrentRemark = item.Remarks ? item.Remarks : '';
    this.CurrentRemarkIndex = i;
    this.modalService.open(content, { centered: true });
  }
  
  openModal_sm(content: any) {
    this.Flag = false;
    this.Start = 0;
    this.End = 0;
    this.SelectRoomType = 'all';
    this.SelectCondition = 'dirty';
    this.SelectRoom = 'all';
    this.modalService.open(content, { centered: true });
  }

  openmodal_addhousekeeper(content: any) {
    this.modalService.open(content, { centered: true });
  }
  
  openModalAddHouseKeeper(content: any) {
    this.modalService.open(content, { centered: true });
  }

  saveRemark() {
    this.RoomDetails[this.CurrentRemarkIndex].Remarks = this.CurrentRemark;
    this.RoomDetails[this.CurrentRemarkIndex].Changed = true;
    this.modalService.dismissAll();
  }

  search(event: any) {
    this.RoomDetails.forEach((element: any) => {
      if (
        JSON.stringify(element)?.toLowerCase()?.includes(event.target.value.toLowerCase())
      ) {
        element.Show = true;
      } else {
        element.Show = false;
      }
    });
  }
}
