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
  isShowingSchedule = false;

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
        firstName: ['', [
          Validators.required,
          Validators.pattern("^[a-zA-Z.'\\s]*$"),
        ]],
        lastName: ['', [
          Validators.required,
          Validators.pattern("^[a-zA-Z.'\\s]*$"),
        ]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required]],
        schedule: this.fb.array([
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

  get schedule(): FormArray {
    return this.HouseKeeperForm.get('schedule') as FormArray;
  }

  createScheduleGroup(day: string, working: boolean): FormGroup {
    return this.fb.group({
      day: [day],
      shiftStartTime: ['12:00'],
      shiftEndTime: ['00:00'],
      working: [working],
    });
  } 

  addHouseKeeper() {
    let housekeeper = this.HouseKeeperForm.value;
    let working = false;
    for (let s of housekeeper.schedule) {
      if (s.working) {
        working = true;
      }
      let d = new Date();
      d.setHours(
        s.shiftEndTime.split(':')[0],
        s.shiftEndTime.split(':')[1],
        0,
        0
      );
      let d2 = new Date();
      d2.setHours(
        s.shiftStartTime.split(':')[0],
        s.shiftStartTime.split(':')[1],
        0,
        0
      );

      s.shiftEndTime = d.getHours() + ':' + d.getMinutes();
      s.shiftStartTime = d2.getHours() + ':' + d2.getMinutes();
    }
    if (working) {
      this.crudService
      .post(APIConstant.CREATE_HOUSE_KEEPER, 
        housekeeper,
      )
      .then((response: any) => {
        this.alertService.successAlert('Housekeeper added successfully!');
        this.ngOnInit();
      })
      .catch((error) => {
        this.alertService.errorAlert(error?.error?.message);
      })
      .finally(() => {
        this.modalService.dismissAll();
      });
    } else {
      this.alertService.errorAlert('Please add valid schedule!');
    }
  }

  show_Schedule() {
    this.isShowingSchedule = !this.isShowingSchedule;
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

  
  openModal_sm(content: any) {
    this.Flag = false;
    this.Start = 0;
    this.End = 0;
    this.SelectRoomType = 'all';
    this.SelectCondition = 'dirty';
    this.SelectRoom = 'all';
    this.modalService.open(content, { centered: true });
  }
  
  openModalAddHouseKeeper(content: any) {
    this.modalService.open(content, { centered: true });
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
