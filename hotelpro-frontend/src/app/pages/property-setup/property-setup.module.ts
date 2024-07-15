import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddUpdatePropertyComponent } from './add-update-property/add-update-property.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { NgxFileDropModule } from 'ngx-file-drop';
import { FileUploadComponent } from '../../core/reused/file-upload/file-upload.component';

const routes: Routes = [
  { path: '', redirectTo: 'Add', pathMatch: 'full' },
  {
    path: 'Add',
    component: AddUpdatePropertyComponent,
  },
];

@NgModule({
  declarations: [AddUpdatePropertyComponent],
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgxFileDropModule,
    FileUploadComponent,
  ],
})
export class PropertySetupModule {}
