import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { APIConstant } from '../../../core/constants/APIConstant';
import { AuthService } from '../../../core/services/auth.service';
import { CrudService } from '../../../core/services/crud.service';
import { CustomValidators } from '../../../core/shared/validators/custom-validators';

@Component({
  selector: 'app-add-update-property',
  templateUrl: './add-update-property.component.html',
  styleUrl: './add-update-property.component.css',
})
export class AddUpdatePropertyComponent implements OnInit {
  userInfo: any;
  propertyUnitForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private crudService: CrudService,
    private fb: FormBuilder
  ) {}
  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo()?.user;

    this.propertyUnitForm = this.fb.group({
      propertyUnitName: [
        '',
        [Validators.required, CustomValidators.noLeadingSpace],
      ],
      propertyUnitLegalName: ['', [Validators.required]],
      propertyUnitType: ['', [Validators.required]],
      description: ['', [Validators.required]],
      website: ['', [Validators.required]],
      propertyAddress: this.fb.group({
        addressLine1: ['', [Validators.required]],
        addressLine2: [''],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        country: ['', [Validators.required]],
        zipCode: ['', [Validators.required]],
      }),
      managerDetails: this.fb.group({
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        phone: ['', [Validators.required]],
        email: ['', [Validators.required]],
      }),
    });
  }

  onSubmit(): void {
    console.log(this.propertyUnitForm.value);
    if (this.propertyUnitForm.valid) {
      console.log(this.propertyUnitForm.value);
    } else {
      this.propertyUnitForm.markAllAsTouched(); // Mark all controls as touched to display validation errors
    }
  }
  rr() {
    // this.propertyUnitForm.reset({
    //   username: 'ravi',
    //   password: 'sss',
    // });
  }
}
