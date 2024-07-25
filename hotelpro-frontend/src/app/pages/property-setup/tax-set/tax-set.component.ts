import { Component, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService } from '../../../core/services/alert.service';
import { CrudService } from '../../../core/services/crud.service';
import { APIConstant } from '../../../core/constants/APIConstant';

@Component({
  selector: 'app-tax-set',
  templateUrl: './tax-set.component.html',
  styleUrls: ['./tax-set.component.css'],
})
export class TaxSetComponent implements OnInit {
  propertyUnitId: string | null = '';
  taxDetailsForm!: FormGroup;
  allTaxes: any[] = [];
  newTax = false;

  constructor(
    private fb: FormBuilder,
    private crudService: CrudService,
    private alertService: AlertService,
    private activeRoute: ActivatedRoute,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.propertyUnitId =
      this.activeRoute.snapshot.paramMap.get('propertyUnitId');
    this.initForm();
    this.loadTaxes();
  }

  private initForm(): void {
    this.taxDetailsForm = this.fb.group({
      _id: [''],
      taxName: ['', [Validators.required]],
      taxPercentage: [0.0, [Validators.required, Validators.min(1)]],
      active: [false],
    });
  }

  private loadTaxes(): void {
    if (!this.propertyUnitId) {
      this.alertService.errorAlert('Property Unit ID is missing');
      return;
    }

    this.crudService
      .post(APIConstant.GET_ALL_TAXES + this.propertyUnitId)
      .then((response: any) => {
        console.log(response);
        this.allTaxes = response.data;
        this.alertService.successAlert(response.message);
      })
      .catch((error: any) => {
        this.alertService.errorAlert(error.message);
        console.log(error);
      });
  }

  openTaxForm(content: TemplateRef<any>, tax?: any): void {
    if (tax) {
      this.newTax = false;
      this.taxDetailsForm.patchValue(tax);
    } else {
      this.newTax = true;
      this.taxDetailsForm.reset({ _id: '', taxPercentage: 0.0, active: false });
    }

    this.modalService.open(content).result.then((result) => {
      if (result) {
        if (this.taxDetailsForm.invalid) {
          return;
        }
        console.log(this.taxDetailsForm.value);
        const obj = this.taxDetailsForm.value;
        obj.propertyUnitId = this.propertyUnitId;
        const apiEndpoint = tax
          ? APIConstant.UPDATE_TAX + tax._id
          : APIConstant.CREATE_TAX;

        this.crudService
          .post(apiEndpoint, obj)
          .then((response: any) => {
            console.log(response);
            this.loadTaxes();
            this.alertService.successAlert(response.message);
          })
          .catch((error: any) => {
            this.alertService.errorAlert(error.message);
            console.log(error);
          });
      }
    });
  }
}
