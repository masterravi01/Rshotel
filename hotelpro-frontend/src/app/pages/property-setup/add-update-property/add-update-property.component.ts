import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { APIConstant } from '../../../core/constants/APIConstant';
import { AuthService } from '../../../core/services/auth.service';
import { CrudService } from '../../../core/services/crud.service';

@Component({
  selector: 'app-add-update-property',
  templateUrl: './add-update-property.component.html',
  styleUrl: './add-update-property.component.css',
})
export class AddUpdatePropertyComponent implements OnInit {
  userInfo: any;
  userForm!: FormGroup;

  constructor(
    private authService: AuthService,
    private crudService: CrudService,
    private fb: FormBuilder
  ) {}
  ngOnInit(): void {
    const u = this.authService.getUserInfo();
    this.userInfo = u?.user;

    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      console.log(this.userForm.value);
    } else {
      this.userForm.markAllAsTouched(); // Mark all controls as touched to display validation errors
    }
  }
  rr() {
    this.userForm.reset({
      username: 'ravi',
      password: 'sss',
    });
  }
}
