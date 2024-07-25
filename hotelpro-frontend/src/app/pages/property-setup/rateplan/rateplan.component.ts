import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-rateplan',
  standalone: true,
  imports: [],
  templateUrl: './rateplan.component.html',
  styleUrl: './rateplan.component.css',
})
export class RateplanComponent implements OnInit {
  ratePlanForm!: FormGroup;
  propertyUnitId: string | null = '';

  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.propertyUnitId =
      this.activeRoute.snapshot.paramMap.get('propertyUnitId');

    this.ratePlanForm = this.fb.group({
      ratePlanName: ['', Validators.required],
      ratePlanShortName: ['', Validators.required],
      ratePlanDescription: ['', Validators.required],
      isBaseRate: [false],
      active: [false],
      cancellationPolicyId: [''],
      noShowPolicyId: [''],
      propertyUnitId: [''],
      isRefundable: [false],
      roomTypeRate: this.fb.array([]),
    });
  }

  onSubmit() {
    console.log('submit');
  }
}
