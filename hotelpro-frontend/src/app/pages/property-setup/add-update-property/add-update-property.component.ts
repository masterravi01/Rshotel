import { Component, OnInit } from '@angular/core';
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
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../../../core/services/alert.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-update-property',
  templateUrl: './add-update-property.component.html',
  styleUrls: ['./add-update-property.component.css'],
})
export class AddUpdatePropertyComponent implements OnInit {
  userInfo: any;
  propertyUnitForm!: FormGroup;
  fileerror = '';
  profileImagePreview: string | null = null; // For single profile image preview
  roomImagesPreviews: string[] = []; // For multiple room images previews
  profileImageFile: File | null = null; // For single profile image file
  roomImagesFiles: File[] = []; // For multiple room images files

  constructor(
    private authService: AuthService,
    private crudService: CrudService,
    private fb: FormBuilder,
    private alertService: AlertService,
    public http: HttpClient,
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

  public droppedProfile(files: NgxFileDropEntry[]) {
    if (files.length > 1) {
      this.fileerror = 'Only one file can be uploaded for profile image.';
      return;
    }
    const droppedFile = files[0];
    if (
      droppedFile.fileEntry.isFile &&
      this.isFileAllowed(droppedFile.fileEntry.name)
    ) {
      const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
      fileEntry.file((file: File) => {
        if (this.isFileSizeAllowed(file.size)) {
          this.profileImageFile = file;
          this.generatePreview(file, true);
        } else {
          this.fileerror =
            'Max size of a file allowed is 2 mb, files with size more than 2 mb are discarded.';
        }
      });
    } else {
      this.fileerror =
        "Only files in '.jpg', '.jpeg', '.png' format are accepted.";
    }
  }

  public droppedRooms(files: NgxFileDropEntry[]) {
    this.roomImagesFiles = [];
    this.roomImagesPreviews = [];
    for (const droppedFile of files) {
      if (
        droppedFile.fileEntry.isFile &&
        this.isFileAllowed(droppedFile.fileEntry.name)
      ) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          if (this.isFileSizeAllowed(file.size)) {
            this.roomImagesFiles.push(file);
            this.generatePreview(file, false);
          } else {
            this.fileerror =
              'Max size of a file allowed is 2 mb, files with size more than 2 mb are discarded.';
          }
        });
      } else {
        this.fileerror =
          "Only files in '.jpg', '.jpeg', '.png' format are accepted.";
      }
    }
  }

  uploadProfileImage() {
    if (this.profileImageFile) {
      const formData = new FormData();
      formData.append(
        'file',
        this.profileImageFile,
        this.profileImageFile.name
      );
      this.crudService
        .post(APIConstant.UPLOAD_PROFILE_PHOTO, formData, {
          skipLoader: true,
        })
        .then((response: any) => {
          this.alertService.successAlert(response.message);
        })
        .catch((error) => {
          this.alertService.errorAlert(error.message);
        });
    }
  }

  uploadRoomImages() {
    if (this.roomImagesFiles.length > 0) {
      const formData = new FormData();
      this.roomImagesFiles.forEach((file) =>
        formData.append('file', file, file.name)
      );
      this.crudService
        .post(APIConstant.UPLOAD_ROOMS_PHOTOS, formData, {
          skipLoader: true,
        })
        .then((response: any) => {
          this.alertService.successAlert(response.message);
        })
        .catch((error) => {
          this.alertService.errorAlert(error.message);
        });
    }
  }

  generatePreview(file: File, isProfile: boolean): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (isProfile) {
        this.profileImagePreview = e.target.result;
      } else {
        this.roomImagesPreviews.push(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  }

  removeProfileImage() {
    this.profileImagePreview = null;
    this.profileImageFile = null;
  }

  removeRoomImage(index: number) {
    this.roomImagesPreviews.splice(index, 1);
    this.roomImagesFiles.splice(index, 1);
  }

  isFileAllowed(fileName: string): boolean {
    const allowedFiles = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG'];
    const regex = /(?:\.([^.]+))?$/;
    const extension = regex.exec(fileName);
    return (
      extension !== undefined &&
      extension !== null &&
      allowedFiles.includes(extension[0])
    );
  }

  isFileSizeAllowed(size: number): boolean {
    return size <= 2000000;
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
}
