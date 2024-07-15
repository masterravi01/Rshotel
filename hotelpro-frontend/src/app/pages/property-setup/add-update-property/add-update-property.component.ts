import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { APIConstant } from '../../../core/constants/APIConstant';
import { AuthService } from '../../../core/services/auth.service';
import { CrudService } from '../../../core/services/crud.service';
import { CustomValidators } from '../../../core/shared/validators/custom-validators';
import {
  NgxFileDropEntry,
  FileSystemFileEntry,
  FileSystemDirectoryEntry,
} from 'ngx-file-drop';
import { AlertService } from '../../../core/services/alert.service';
import { Router } from '@angular/router';
import { FileUploadComponent } from '../../../core/reused/file-upload/file-upload.component';

@Component({
  selector: 'app-add-update-property',
  templateUrl: './add-update-property.component.html',
  styleUrls: ['./add-update-property.component.css'],
})
export class AddUpdatePropertyComponent implements OnInit {
  userInfo: any;
  propertyUnitForm!: FormGroup;

  @ViewChild(FileUploadComponent) fileUploadComponent!: FileUploadComponent;

  constructor(
    private authService: AuthService,
    private crudService: CrudService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private router: Router
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
    if (this.propertyUnitForm.valid) {
      console.log(this.propertyUnitForm.value);
    } else {
      this.propertyUnitForm.markAllAsTouched(); // Mark all controls as touched to display validation errors
    }
  }

  createProp() {
    this.crudService
      .post('property/create-property', {})
      .then((response: any) => {
        this.alertService.successAlert(response.message);
      })
      .catch((error) => {
        this.alertService.errorAlert(error.message);
      });
  }

  getfile(files: File[]) {
    if (files.length > 0) {
      const formData = new FormData();
      files.forEach((file) => formData.append('file', file, file.name));
      this.crudService
        .post(APIConstant.UPLOAD_ROOMS_PHOTOS, formData, {
          skipLoader: true,
        })
        .then((response: any) => {
          this.fileUploadComponent.clearFiles();
          this.alertService.successAlert(response.message);
        })
        .catch((error) => {
          this.alertService.errorAlert(error.message);
        });
    }
  }
}
