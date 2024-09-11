import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormArray,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AlertService } from '../../../core/services/alert.service';
import { CrudService } from '../../../core/services/crud.service';
import { APIConstant } from '../../../core/constants/APIConstant';
import { CommonModule } from '@angular/common';
import { CustomValidators } from '../../../core/shared/validators/custom-validators';


@Component({
  selector: 'app-manage-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './manage-user.component.html',
  styleUrl: './manage-user.component.css'
})
export class ManageUserComponent implements OnInit {

  propertyUnitId: string | null = '';
  roomTypesForm!: FormGroup;

  constructor(
    private crudService: CrudService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.propertyUnitId =
      this.activeRoute.snapshot.paramMap.get('propertyUnitId');
    this.roomTypesForm = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          CustomValidators.noLeadingSpace,
          Validators.minLength(2),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          CustomValidators.noLeadingSpace,
          Validators.minLength(2),
        ],
      ],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      active: [true, [Validators.required]],
    });

    this.fetchData();
  }


  fetchData() {
    this.crudService
      .post(APIConstant.READ_USER_BY_PROPERTY_UNIT, { propertyUnitId: this.propertyUnitId })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        this.alertService.errorAlert(
          error?.error?.message ||
          'An error occurred while fetch users'
        );
        console.error(error);
      });
  }

}
