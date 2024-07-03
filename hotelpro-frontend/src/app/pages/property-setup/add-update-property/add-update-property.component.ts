import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-add-update-property',
  templateUrl: './add-update-property.component.html',
  styleUrls: ['./add-update-property.component.css'],
})
export class AddUpdatePropertyComponent implements OnInit, OnDestroy {
  userInfo: any;
  userForm!: FormGroup;
  private worker!: Worker;
  public workerResponse: any;

  constructor(private authService: AuthService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo()?.user;

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

  ngOnDestroy() {
    if (this.worker) {
      this.worker.terminate();
    }
  }
  callWebWorker() {
    if (typeof Worker !== 'undefined') {
      // Create a new web worker
      this.worker = new Worker(
        new URL('../../../core/workers/api-caller.worker', import.meta.url),
        { type: 'module' }
      );

      // Listen for messages from the worker
      this.worker.onmessage = ({ data }) => {
        if (data.status === 'success') {
          this.workerResponse = data.data;
        } else {
          console.error(`Worker error: ${data.message}`);
        }
      };

      // Post a message to the worker to make an API call
      this.worker.postMessage({
        url: 'https://fakestoreapi.com/products/', // Replace with your API URL
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          // Add other headers as needed
        },
      });
    } else {
      console.warn('Web Workers are not supported in this environment.');
    }
  }
}
