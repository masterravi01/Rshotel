import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { APIConstant } from '../../../core/constants/APIConstant';
import { AlertService } from '../../../core/services/alert.service';
import { CrudService } from '../../../core/services/crud.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GeneralModalService } from '../../../core/services/general-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-rateplan',
  templateUrl: './rateplan.component.html',
  styleUrl: './rateplan.component.css',
})
export class RateplanComponent implements OnInit {
  ratePlanForm!: FormGroup;
  propertyUnitId: string | null = '';
  cancelPolicyForm!: FormGroup;
  noshowPolicyForm!: FormGroup;
  cancellationPolicyList: any[] = [];
  noshowPolicyList: any[] = [];

  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private activeRoute: ActivatedRoute,
    private router: Router,
    private generalModal: GeneralModalService,
    private modalService: NgbModal
  ) {}

  //   read roomtype
  // read,create,update rateplan
  // read,update,create cancel &  no show

  ngOnInit() {
    this.propertyUnitId =
      this.activeRoute.snapshot.paramMap.get('propertyUnitId');
    this.noshowPolicyForm = this.fb.group({
      noShowPolicyName: ['', Validators.required],
      chargeType: ['percentage', Validators.required],
      chargeValue: [10, Validators.required],
      propertyUnitId: [''],
      policyDescription: [''],
    });
    this.cancelPolicyForm = this.fb.group({
      cancelPolicyName: ['', Validators.required],
      windowRange: ['24h', Validators.required],
      windowType: ['percentage', Validators.required],
      insideWindowCharge: [10, Validators.required],
      outsideWindowCharge: [10, Validators.required],
      propertyUnitId: [''],
      policyDescription: [''],
    });
    this.ratePlanForm = this.fb.group({
      _id: [''],
      ratePlanName: ['', Validators.required],
      ratePlanShortName: ['', Validators.required],
      ratePlanDescription: ['', Validators.required],
      isBaseRate: [true],
      active: [true],
      cancellationPolicyId: [''],
      noShowPolicyId: [''],
      propertyUnitId: [''],
      isRefundable: [false],
      roomTypeRates: this.fb.array([]),
    });
    this.readRoomTypes();
    this.readRate();
  }
  readRoomTypes() {
    // this.crudService
    //   .post(APIConstant.READ_ROOMTYPES + this.propertyUnitId)
    //   .then((response: any) => {
    //     console.log(response);
    //     for (let r of response.data) {
    //       this.addRoomType(r);
    //     }
    //     console.log(this.ratePlanForm.value);
    //     this.alertService.successAlert(response.message);
    //   })
    //   .catch((error: any) => {
    //     console.log(error);
    //     this.alertService.errorAlert(error.message);
    //   });
  }

  createRoomTypeRate(r?: any): FormGroup {
    return this.fb.group({
      roomTypeName: [r?.roomTypeName || '', [Validators.required]],
      roomTypeId: [r?.roomTypeId || ''],
      baseRate: [
        r?.baseRate || 0,
        [Validators.required, Validators.pattern('[0-9]+(.[0-9]{1,2})?%?')],
      ],
      adultRate: [
        r?.adultRate || 0,
        [Validators.required, Validators.pattern('[0-9]+(.[0-9]{1,2})?%?')],
      ],
      childRate: [
        r?.childRate || 0,
        [Validators.required, Validators.pattern('[0-9]+(.[0-9]{1,2})?%?')],
      ],
    });
  }

  addRoomType(roomType?: any): void {
    this.roomTypeRates.push(this.createRoomTypeRate(roomType));
  }

  get roomTypeRates(): FormArray {
    return this.ratePlanForm.get('roomTypeRates') as FormArray;
  }
  openNoShow(content: TemplateRef<any>, data?: any): void {
    this.modalService.open(content).result.then((result) => {
      console.log(result, this.noshowPolicyForm.value);
      if (result) {
      } else {
      }
    });
  }

  openCancellation(content: TemplateRef<any>, data?: any): void {
    this.modalService.open(content).result.then((result) => {
      console.log(result, this.cancelPolicyForm.value);
      if (result) {
      } else {
      }
    });
  }

  onSubmit() {
    console.log(this.ratePlanForm.value);

    if (this.ratePlanForm.get('_id')?.value) {
    }
    const callApiUrl = this.ratePlanForm.get('_id')?.value
      ? APIConstant.UPDATE_RATEPLAN
      : APIConstant.CREATE_RATEPLAN;
    this.generalModal
      .openModal('Are You Sure Want submit this details ?', '')
      .then((result) => {
        if (result) {
          // User confirmed
          let obj = this.ratePlanForm.value;
          obj.propertyUnitId = this.propertyUnitId;
          this.crudService
            .post(callApiUrl, obj)
            .then((response: any) => {
              console.log(response);
              this.alertService.successAlert(response.message);
            })
            .catch((error: any) => {
              console.log(error);
              this.alertService.errorAlert(error.message);
            });
        } else {
          // User cancelled
          console.log('no');
        }
      });
  }

  readRate() {
    this.crudService
      .post(APIConstant.READ_RATEPLAN, { propertyUnitId: this.propertyUnitId })
      .then((response: any) => {
        console.log(response);
        this.ratePlanForm.reset(response.data);
        for (let r of response.data.rateRoomTypes) {
          this.addRoomType(r);
        }
        console.log(this.ratePlanForm.value);
        this.alertService.successAlert(response.message);
      })
      .catch((error: any) => {
        console.log(error);
        this.alertService.errorAlert(error.message);
      });
  }
}
