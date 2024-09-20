import { Component, OnInit, TemplateRef } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
  AbstractControl,
  ValidatorFn,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { APIConstant } from '../../../core/constants/APIConstant';
import { AlertService } from '../../../core/services/alert.service';
import { CrudService } from '../../../core/services/crud.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GeneralModalService } from '../../../core/services/general-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-rateplan',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
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
  ratePlanId: string | null = 'Add';
  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private activeRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private generalModal: GeneralModalService,
    private modalService: NgbModal
  ) {}

  //   read roomtype
  // read,create,update rateplan
  // read,update,create cancel &  no show

  ngOnInit() {
    this.propertyUnitId = this.authService.getUserInfo()?.user?.propertyUnitId;
    this.ratePlanId = this.activeRoute.snapshot.paramMap.get('ratePlanId');
    this.noshowPolicyForm = this.fb.group({
      _id: [''],
      noShowPolicyName: ['', Validators.required],
      chargeType: ['percentage', Validators.required],
      chargeValue: [10, Validators.required],
      propertyUnitId: [''],
      policyDescription: [''],
    });
    this.cancelPolicyForm = this.fb.group({
      _id: [''],
      cancelPolicyName: ['', Validators.required],
      windowRange: ['24h', Validators.required],
      windowType: ['percentage', Validators.required],
      insideWindowCharge: [10, Validators.required],
      outsideWindowCharge: [10, Validators.required],
      propertyUnitId: ['', Validators.required],
      policyDescription: [''],
    });
    this.ratePlanForm = this.fb.group({
      _id: [''],
      ratePlanName: ['', Validators.required],
      ratePlanShortName: ['', Validators.required],
      ratePlanDescription: ['', Validators.required],
      isBaseRate: [false],
      active: [true],
      cancellationPolicyId: ['', Validators.required],
      noShowPolicyId: ['', Validators.required],
      propertyUnitId: [''],
      isRefundable: [false],
      roomTypeRates: this.fb.array([]),
    });
    if (this.ratePlanId == 'Add') {
      this.readRoomTypes();
    } else {
      this.readRate();
    }

    this.readAllCancelationPolicies();
    this.readAllNoShowPolicies();
  }
  readRoomTypes() {
    this.crudService
      .post(APIConstant.READ_ROOMTYPES + this.propertyUnitId)
      .then((response: any) => {
        console.log(response);
        for (let r of response.data) {
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
  openNoShow(content: TemplateRef<any>): void {
    console.log(this.ratePlanForm.value);
    const data = this.noshowPolicyList.find(
      (n) => n._id == this.ratePlanForm.get('noShowPolicyId')?.value
    );
    if (data) {
      this.noshowPolicyForm.reset(data);
    } else {
      this.noshowPolicyForm.get('_id')?.setValue('');
      this.noshowPolicyForm.get('noShowPolicyName')?.setValue('');
      this.noshowPolicyForm.get('chargeType')?.setValue('percentage');
      this.noshowPolicyForm.get('chargeValue')?.setValue(10);
      this.noshowPolicyForm
        .get('propertyUnitId')
        ?.setValue(this.propertyUnitId);
      this.noshowPolicyForm.get('policyDescription')?.setValue('');
    }
    this.modalService.open(content).result.then((result) => {
      console.log(result, this.noshowPolicyForm.value);
      if (result) {
        this.addUpdateNoShowPolicy();
      } else {
      }
    });
  }

  openCancellation(content: TemplateRef<any>): void {
    console.log(this.ratePlanForm.value);
    const data = this.cancellationPolicyList.find(
      (n) => n._id == this.ratePlanForm.get('cancellationPolicyId')?.value
    );
    if (data) {
      this.cancelPolicyForm.reset(data);
    } else {
      this.cancelPolicyForm.get('_id')?.setValue('');
      this.cancelPolicyForm.get('cancelPolicyName')?.setValue('');
      this.cancelPolicyForm.get('windowRange')?.setValue('24h');
      this.cancelPolicyForm.get('windowType')?.setValue('percentage');
      this.cancelPolicyForm.get('insideWindowCharge')?.setValue(10);
      this.cancelPolicyForm.get('outsideWindowCharge')?.setValue(10);
      this.cancelPolicyForm
        .get('propertyUnitId')
        ?.setValue(this.propertyUnitId);
      this.cancelPolicyForm.get('policyDescription')?.setValue('');
    }
    this.modalService.open(content).result.then((result) => {
      console.log(result, this.cancelPolicyForm.value);
      if (result) {
        this.addUpdateCancelPolicy();
      } else {
      }
    });
  }

  onSubmit() {
    console.log(this.ratePlanForm.value);

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
    let obj = {};
    if (this.router.url == '/baserate-setup') {
      obj = {
        isBaseRate: true,
        propertyUnitId: this.propertyUnitId,
      };
    } else if (this.ratePlanId) {
      obj = {
        ratePlanId: this.ratePlanId,
        propertyUnitId: this.propertyUnitId,
      };
    } else {
      this.alertService.errorAlert('No Rate Plan Found !');
      window.history.back();
    }
    this.crudService
      .post(APIConstant.READ_RATEPLAN, obj)
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
        this.alertService.errorAlert(error?.error?.message);
      });
  }
  readAllNoShowPolicies() {
    this.crudService
      .post(APIConstant.GET_ALL_NOSHOW_POLICIES + this.propertyUnitId)
      .then((response: any) => {
        console.log(response);
        this.noshowPolicyList = response.data;
      })
      .catch((error: any) => {
        console.log(error);
        this.alertService.errorAlert(error.message);
      });
  }
  readAllCancelationPolicies() {
    this.crudService
      .post(APIConstant.GET_ALL_CANCELLATION_POLICIES + this.propertyUnitId)
      .then((response: any) => {
        console.log(response);
        this.cancellationPolicyList = response.data;
      })
      .catch((error: any) => {
        console.log(error);
        this.alertService.errorAlert(error.message);
      });
  }
  addUpdateNoShowPolicy() {
    const callApiUrl = this.noshowPolicyForm.get('_id')?.value
      ? APIConstant.UPDATE_NOSHOW_POLICY +
        this.noshowPolicyForm.get('_id')?.value
      : APIConstant.CREATE_NOSHOW_POLICY;
    this.crudService
      .post(callApiUrl, this.noshowPolicyForm.value)
      .then((response: any) => {
        console.log(response);
        if (this.noshowPolicyForm.get('_id')?.value) {
          this.noshowPolicyList = this.noshowPolicyList.map((obj) => {
            if (obj._id === this.noshowPolicyForm.get('_id')?.value) {
              return response?.data;
            }
            return obj;
          });
        } else {
          this.noshowPolicyList.push(response?.data);
        }

        this.ratePlanForm.get('noShowPolicyId')?.setValue(response?.data?._id);
      })
      .catch((error: any) => {
        console.log(error);
        this.alertService.errorAlert(error.message);
      });
  }
  addUpdateCancelPolicy() {
    const callApiUrl = this.cancelPolicyForm.get('_id')?.value
      ? APIConstant.UPDATE_CANCELLATION_POLICY +
        this.cancelPolicyForm.get('_id')?.value
      : APIConstant.CREATE_CANCELLATION_POLICY;
    this.crudService
      .post(callApiUrl, this.cancelPolicyForm.value)
      .then((response: any) => {
        console.log(response);
        if (this.cancelPolicyForm.get('_id')?.value) {
          this.cancellationPolicyList = this.cancellationPolicyList.map(
            (obj) => {
              if (obj._id === this.cancelPolicyForm.get('_id')?.value) {
                return response?.data;
              }
              return obj;
            }
          );
        } else {
          this.cancellationPolicyList.push(response?.data);
        }

        this.ratePlanForm
          .get('cancellationPolicyId')
          ?.setValue(response?.data?._id);
      })
      .catch((error: any) => {
        console.log(error);
        this.alertService.errorAlert(error.message);
      });
  }

  next() {
    this.router.navigate(['/tax-setup', this.propertyUnitId]);
  }
}
